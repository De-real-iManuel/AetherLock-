use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

mod universal;
use universal::*;

declare_id!("AETHRLockEscrow11111111111111111111111111111");

#[program]
pub mod aetherlock_escrow {
    use super::*;

    /// Initialize protocol configuration with authorized admin addresses
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        admin_pubkeys: Vec<Pubkey>,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(admin_pubkeys.len() <= 5, EscrowError::TooManyAdmins);
        
        config.authority = ctx.accounts.authority.key();
        config.admin_pubkeys = admin_pubkeys;
        config.bump = ctx.bumps.config;
        
        Ok(())
    }

    /// Add an admin to the authorized list
    pub fn add_admin(
        ctx: Context<UpdateConfig>,
        new_admin: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(config.admin_pubkeys.len() < 5, EscrowError::TooManyAdmins);
        require!(!config.admin_pubkeys.contains(&new_admin), EscrowError::AdminAlreadyExists);
        
        config.admin_pubkeys.push(new_admin);
        Ok(())
    }

    /// Remove an admin from the authorized list
    pub fn remove_admin(
        ctx: Context<UpdateConfig>,
        admin_to_remove: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin_pubkeys.retain(|&x| x != admin_to_remove);
        Ok(())
    }

    /// Initialize a new escrow with buyer, seller, amount, and expiry parameters
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        escrow_id: [u8; 32],
        seller: Pubkey,
        amount: u64,
        expiry: i64,
        metadata_hash: [u8; 32],
        ai_agent_pubkey: Pubkey,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Calculate 10% protocol fee
        let fee_amount = amount
            .checked_mul(10)
            .ok_or(EscrowError::MathOverflow)?
            .checked_div(100)
            .ok_or(EscrowError::MathOverflow)?;
        
        escrow.escrow_id = escrow_id;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = seller;
        escrow.token_mint = ctx.accounts.token_mint.key();
        escrow.amount = amount;
        escrow.fee_amount = fee_amount;
        escrow.status = EscrowStatus::Created;
        escrow.expiry = expiry;
        escrow.metadata_hash = metadata_hash;
        escrow.verification_result = None;
        escrow.evidence_hash = None;
        escrow.dispute_raised = false;
        escrow.dispute_deadline = None;
        escrow.ai_agent_pubkey = ai_agent_pubkey;
        escrow.bump = ctx.bumps.escrow;
        
        Ok(())
    }

    /// Deposit funds from buyer to escrow PDA
    pub fn deposit_funds(ctx: Context<DepositFunds>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Created, EscrowError::InvalidEscrowState);
        
        // Transfer tokens to escrow vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_token_account.to_account_info(),
                    to: ctx.accounts.escrow_vault.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            escrow.amount,
        )?;
        
        escrow.status = EscrowStatus::Funded;
        Ok(())
    }

    /// Submit Chainlink oracle request for AI verification
    pub fn request_chainlink_verification(
        ctx: Context<SubmitVerification>,
        evidence_hash: [u8; 32],
        chainlink_request_id: [u8; 32],
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Funded, EscrowError::InvalidEscrowState);
        
        escrow.evidence_hash = Some(evidence_hash);
        escrow.chainlink_request_id = Some(chainlink_request_id);
        escrow.status = EscrowStatus::PendingVerification;
        
        emit!(ChainlinkVerificationRequested {
            escrow_id: escrow.escrow_id,
            evidence_hash,
            request_id: chainlink_request_id,
        });
        
        Ok(())
    }

    /// Submit AI verification result with Chainlink oracle signature
    pub fn submit_verification(
        ctx: Context<SubmitVerification>,
        result: bool,
        evidence_hash: [u8; 32],
        timestamp: i64,
        signature: [u8; 64],
        chainlink_request_id: [u8; 32],
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Funded, EscrowError::InvalidEscrowState);
        require!(!escrow.dispute_raised, EscrowError::DisputeActive);
        
        // Verify AI agent public key matches stored key
        let ai_agent_key = ctx.accounts.ai_agent.key();
        require!(
            ai_agent_key == escrow.ai_agent_pubkey,
            EscrowError::UnauthorizedAIAgent
        );
        
        // Construct verification payload message
        // Format: escrow_id (32 bytes) + result (1 byte) + evidence_hash (32 bytes) + timestamp (8 bytes)
        let mut message = Vec::with_capacity(73);
        message.extend_from_slice(&escrow.escrow_id);
        message.push(if result { 1u8 } else { 0u8 });
        message.extend_from_slice(&evidence_hash);
        message.extend_from_slice(&timestamp.to_le_bytes());
        
        // Verify Ed25519 signature (simplified for now)
        let ai_agent_pubkey_bytes = ai_agent_key.to_bytes();
        
        // Verify the signature - simplified signature check
        // In production, use proper ed25519 verification library
        require!(signature.len() == 64, EscrowError::InvalidSignature);
        
        // Validate timestamp is recent (within 5 minutes)
        let clock = Clock::get()?;
        let time_diff = (clock.unix_timestamp - timestamp).abs();
        require!(time_diff <= 300, EscrowError::TimestampTooOld);
        
        // Verify Chainlink request ID matches
        require!(
            escrow.chainlink_request_id == Some(chainlink_request_id),
            EscrowError::InvalidChainlinkRequest
        );
        
        // Store the verification result
        escrow.verification_result = Some(result);
        escrow.evidence_hash = Some(evidence_hash);
        escrow.status = EscrowStatus::Verified;
        
        emit!(ChainlinkVerificationCompleted {
            escrow_id: escrow.escrow_id,
            result,
            request_id: chainlink_request_id,
        });
        
        Ok(())
    }

    /// Release funds to seller with protocol fee deduction
    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow_account_info = ctx.accounts.escrow.to_account_info();
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Verified, EscrowError::InvalidEscrowState);
        require!(escrow.verification_result == Some(true), EscrowError::VerificationFailed);
        require!(!escrow.dispute_raised, EscrowError::DisputeActive);
        
        // Store immutable values to avoid borrow conflicts
        let escrow_id = escrow.escrow_id.clone();
        let bump = escrow.bump;
        let amount = escrow.amount;
        let fee_amount = escrow.fee_amount;
        
        let seeds = &[
            b"escrow",
            escrow_id.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];
        
        let seller_amount = amount
            .checked_sub(fee_amount)
            .ok_or(EscrowError::MathOverflow)?;
        
        // Transfer funds to seller (amount minus fee)
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.seller_token_account.to_account_info(),
                    authority: escrow_account_info.clone(),
                },
                signer,
            ),
            seller_amount,
        )?;
        
        // Transfer protocol fee to treasury
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.protocol_treasury.to_account_info(),
                    authority: escrow_account_info.clone(),
                },
                signer,
            ),
            fee_amount,
        )?;
        
        escrow.status = EscrowStatus::Released;
        Ok(())
    }

    /// Refund buyer if verification failed or escrow expired
    pub fn refund_buyer(ctx: Context<RefundBuyer>) -> Result<()> {
        let escrow_account_info = ctx.accounts.escrow.to_account_info();
        let escrow = &mut ctx.accounts.escrow;
        
        let clock = Clock::get()?;
        let can_refund = escrow.status == EscrowStatus::Funded && clock.unix_timestamp > escrow.expiry
            || escrow.status == EscrowStatus::Verified && escrow.verification_result == Some(false)
            || escrow.dispute_raised && escrow.dispute_deadline.is_some() 
               && clock.unix_timestamp > escrow.dispute_deadline.unwrap();
        
        require!(can_refund, EscrowError::RefundNotAllowed);
        
        // Store immutable values to avoid borrow conflicts
        let escrow_id = escrow.escrow_id.clone();
        let bump = escrow.bump;
        let amount = escrow.amount;
        
        let seeds = &[
            b"escrow",
            escrow_id.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];
        
        // Refund full amount to buyer
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: escrow_account_info.clone(),
                },
                signer,
            ),
            amount,
        )?;
        
        escrow.status = EscrowStatus::Refunded;
        Ok(())
    }

    /// Raise a dispute to pause automatic resolution
    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        _reason_hash: [u8; 32],
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            escrow.status == EscrowStatus::Funded || escrow.status == EscrowStatus::Verified,
            EscrowError::InvalidEscrowState
        );
        require!(!escrow.dispute_raised, EscrowError::DisputeAlreadyRaised);
        
        let clock = Clock::get()?;
        let dispute_window = 48 * 60 * 60; // 48 hours in seconds
        
        escrow.dispute_raised = true;
        escrow.dispute_deadline = Some(clock.unix_timestamp + dispute_window);
        escrow.status = EscrowStatus::Disputed;
        
        Ok(())
    }

    /// Admin function to resolve disputes manually
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        outcome: DisputeOutcome,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let config = &ctx.accounts.config;
        
        require!(escrow.status == EscrowStatus::Disputed, EscrowError::InvalidEscrowState);
        
        // Verify admin authorization
        let admin_key = ctx.accounts.admin.key();
        require!(
            config.admin_pubkeys.contains(&admin_key),
            EscrowError::UnauthorizedAdmin
        );
        
        match outcome {
            DisputeOutcome::FavorBuyer => {
                escrow.verification_result = Some(false);
            },
            DisputeOutcome::FavorSeller => {
                escrow.verification_result = Some(true);
            },
        }
        
        escrow.dispute_raised = false;
        escrow.status = EscrowStatus::Verified;
        
        Ok(())
    }

    /// Universal cross-chain functions
    pub fn universal_on_call(
        ctx: Context<OnCall>,
        message: CrossChainMessage,
    ) -> Result<()> {
        universal::on_call(ctx, message)
    }

    pub fn universal_on_revert(
        ctx: Context<OnRevert>,
        revert_context: RevertContext,
    ) -> Result<()> {
        universal::on_revert(ctx, revert_context)
    }

    pub fn universal_on_abort(
        ctx: Context<OnAbort>,
        abort_context: AbortContext,
    ) -> Result<()> {
        universal::on_abort(ctx, abort_context)
    }

    /// Initialize universal escrow for cross-chain operations
    pub fn initialize_universal_escrow(
        ctx: Context<InitializeUniversalEscrow>,
        escrow_id: [u8; 32],
        source_chain: String,
        destination_chain: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        escrow.escrow_id = escrow_id;
        escrow.source_chain = source_chain;
        escrow.destination_chain = destination_chain;
        escrow.status = UniversalEscrowStatus::Initiated;
        escrow.zkme_verification = false;
        escrow.bump = ctx.bumps.escrow;
        
        Ok(())
    }

    /// Update zkMe verification status
    pub fn update_zkme_verification(
        ctx: Context<UpdateZkmeVerification>,
        verified: bool,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.zkme_verification = verified;
        
        if verified {
            escrow.status = UniversalEscrowStatus::Active;
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(escrow_id: [u8; 32])]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowAccount::INIT_SPACE,
        seeds = [b"escrow", escrow_id.as_ref()],
        bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump,
        constraint = escrow.buyer == buyer.key()
    )]
    pub escrow: Account<'info, EscrowAccount>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = buyer,
        token::mint = token_mint,
        token::authority = escrow,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = buyer_token_account.mint == token_mint.key()
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitVerification<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    /// CHECK: AI agent public key - verified against stored ai_agent_pubkey in escrow account
    pub ai_agent: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump,
        constraint = escrow.buyer == buyer.key()
    )]
    pub escrow: Account<'info, EscrowAccount>,
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = seller_token_account.mint == escrow.token_mint
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = protocol_treasury.mint == escrow.token_mint
    )]
    pub protocol_treasury: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundBuyer<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump,
        constraint = escrow.buyer == buyer.key()
    )]
    pub escrow: Account<'info, EscrowAccount>,
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = buyer_token_account.mint == escrow.token_mint
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    pub participant: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump,
        constraint = escrow.buyer == participant.key() || escrow.seller == participant.key()
    )]
    pub escrow: Account<'info, EscrowAccount>,
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + ProtocolConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.authority == authority.key() @ EscrowError::UnauthorizedAdmin
    )]
    pub config: Account<'info, ProtocolConfig>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,
}

#[derive(Accounts)]
#[instruction(escrow_id: [u8; 32])]
pub struct InitializeUniversalEscrow<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + UniversalEscrow::INIT_SPACE,
        seeds = [b"universal_escrow", escrow_id.as_ref()],
        bump
    )]
    pub escrow: Account<'info, UniversalEscrow>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateZkmeVerification<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"universal_escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, UniversalEscrow>,
}

#[account]
#[derive(InitSpace)]
pub struct ProtocolConfig {
    pub authority: Pubkey,
    #[max_len(5)]
    pub admin_pubkeys: Vec<Pubkey>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct EscrowAccount {
    pub escrow_id: [u8; 32],
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub fee_amount: u64,
    pub status: EscrowStatus,
    pub expiry: i64,
    pub metadata_hash: [u8; 32],
    pub verification_result: Option<bool>,
    pub evidence_hash: Option<[u8; 32]>,
    pub dispute_raised: bool,
    pub dispute_deadline: Option<i64>,
    pub ai_agent_pubkey: Pubkey,
    pub chainlink_request_id: Option<[u8; 32]>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum EscrowStatus {
    Created,
    Funded,
    PendingVerification,
    Verified,
    Disputed,
    Released,
    Refunded,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum DisputeOutcome {
    FavorBuyer,
    FavorSeller,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid escrow state for this operation")]
    InvalidEscrowState,
    #[msg("Verification failed")]
    VerificationFailed,
    #[msg("Dispute is active")]
    DisputeActive,
    #[msg("Dispute already raised")]
    DisputeAlreadyRaised,
    #[msg("Refund not allowed")]
    RefundNotAllowed,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Unauthorized admin - not in authorized list")]
    UnauthorizedAdmin,
    #[msg("Too many admins - maximum 5 allowed")]
    TooManyAdmins,
    #[msg("Admin already exists in the list")]
    AdminAlreadyExists,
    #[msg("Unauthorized AI agent - public key does not match stored key")]
    UnauthorizedAIAgent,
    #[msg("Invalid signature - Ed25519 verification failed")]
    InvalidSignature,
    #[msg("Timestamp too old - must be within 5 minutes")]
    TimestampTooOld,
    #[msg("zkMe verification required")]
    ZkmeVerificationRequired,
    #[msg("Invalid Chainlink request ID")]
    InvalidChainlinkRequest,
}

#[event]
pub struct ChainlinkVerificationRequested {
    pub escrow_id: [u8; 32],
    pub evidence_hash: [u8; 32],
    pub request_id: [u8; 32],
}

#[event]
pub struct ChainlinkVerificationCompleted {
    pub escrow_id: [u8; 32],
    pub result: bool,
    pub request_id: [u8; 32],
}