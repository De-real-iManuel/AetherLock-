use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CrossChainMessage {
    pub source_chain: String,
    pub destination_chain: String,
    pub escrow_id: [u8; 32],
    pub action: CrossChainAction,
    pub amount: u64,
    pub recipient: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum CrossChainAction {
    InitiateEscrow,
    ReleaseEscrow,
    RefundEscrow,
    VerificationComplete,
}

#[account]
#[derive(InitSpace)]
pub struct UniversalEscrow {
    pub escrow_id: [u8; 32],
    #[max_len(50)]
    pub source_chain: String,
    #[max_len(50)]
    pub destination_chain: String,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub status: UniversalEscrowStatus,
    #[max_len(100)]
    pub cross_chain_tx_hash: Option<String>,
    pub verification_result: Option<bool>,
    pub chainlink_request_id: Option<[u8; 32]>,
    pub zkme_verification: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum UniversalEscrowStatus {
    Initiated,
    CrossChainPending,
    Active,
    VerificationPending,
    Completed,
    Refunded,
    Failed,
}

/// Handle incoming cross-chain call from ZetaChain
pub fn on_call(
    ctx: Context<OnCall>,
    message: CrossChainMessage,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    
    match message.action {
        CrossChainAction::InitiateEscrow => {
            escrow.escrow_id = message.escrow_id;
            escrow.source_chain = message.source_chain.clone();
            escrow.destination_chain = message.destination_chain;
            escrow.buyer = message.recipient;
            escrow.amount = message.amount;
            escrow.status = UniversalEscrowStatus::Active;
            
            emit!(CrossChainEscrowInitiated {
                escrow_id: message.escrow_id,
                source_chain: message.source_chain,
                amount: message.amount,
            });
        },
        CrossChainAction::VerificationComplete => {
            require!(
                escrow.status == UniversalEscrowStatus::VerificationPending,
                UniversalError::InvalidStatus
            );
            
            escrow.verification_result = Some(true);
            escrow.status = UniversalEscrowStatus::Completed;
            
            let release_message = CrossChainMessage {
                source_chain: "solana".to_string(),
                destination_chain: escrow.destination_chain.clone(),
                escrow_id: escrow.escrow_id,
                action: CrossChainAction::ReleaseEscrow,
                amount: escrow.amount,
                recipient: escrow.seller,
            };
            
            emit!(CrossChainRelease {
                message: release_message,
            });
        },
        _ => return Err(UniversalError::UnsupportedAction.into()),
    }
    
    Ok(())
}

/// Handle cross-chain transaction revert
pub fn on_revert(
    ctx: Context<OnRevert>,
    revert_context: RevertContext,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    
    msg!("Cross-chain transaction reverted: {}", revert_context.reason);
    
    escrow.status = UniversalEscrowStatus::Failed;
    
    let refund_message = CrossChainMessage {
        source_chain: "solana".to_string(),
        destination_chain: escrow.source_chain.clone(),
        escrow_id: escrow.escrow_id,
        action: CrossChainAction::RefundEscrow,
        amount: escrow.amount,
        recipient: escrow.buyer,
    };
    
    emit!(CrossChainRefund {
        message: refund_message,
        reason: revert_context.reason,
    });
    
    Ok(())
}

/// Handle cross-chain transaction abort
pub fn on_abort(
    ctx: Context<OnAbort>,
    abort_context: AbortContext,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    
    msg!("Cross-chain transaction aborted: {}", abort_context.reason);
    
    escrow.status = UniversalEscrowStatus::Failed;
    
    emit!(CrossChainAbort {
        escrow_id: escrow.escrow_id,
        reason: abort_context.reason,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct OnCall<'info> {
    #[account(
        mut,
        seeds = [b"universal_escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, UniversalEscrow>,
    /// CHECK: ZetaChain gateway authority
    pub gateway: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct OnRevert<'info> {
    #[account(
        mut,
        seeds = [b"universal_escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, UniversalEscrow>,
    /// CHECK: ZetaChain gateway authority
    pub gateway: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct OnAbort<'info> {
    #[account(
        mut,
        seeds = [b"universal_escrow", escrow.escrow_id.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, UniversalEscrow>,
    /// CHECK: ZetaChain gateway authority
    pub gateway: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RevertContext {
    pub reason: String,
    pub tx_hash: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AbortContext {
    pub reason: String,
    pub error_code: u32,
}

#[event]
pub struct CrossChainEscrowInitiated {
    pub escrow_id: [u8; 32],
    pub source_chain: String,
    pub amount: u64,
}

#[event]
pub struct CrossChainRelease {
    pub message: CrossChainMessage,
}

#[event]
pub struct CrossChainRefund {
    pub message: CrossChainMessage,
    pub reason: String,
}

#[event]
pub struct CrossChainAbort {
    pub escrow_id: [u8; 32],
    pub reason: String,
}

#[error_code]
pub enum UniversalError {
    #[msg("Invalid escrow status")]
    InvalidStatus,
    #[msg("Unsupported cross-chain action")]
    UnsupportedAction,
    #[msg("Math overflow")]
    MathOverflow,
}