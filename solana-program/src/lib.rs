use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("AetherLockEscrow11111111111111111111111111");

#[program]
pub mod aetherlock_escrow {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        amount: u64,
        timeout: i64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = ctx.accounts.seller.key();
        escrow.amount = amount;
        escrow.timeout = timeout;
        escrow.status = EscrowStatus::Active;
        escrow.bump = *ctx.bumps.get("escrow").unwrap();
        
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
            amount,
        )?;
        
        Ok(())
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Active, EscrowError::InvalidStatus);
        
        let seeds = &[
            b"escrow",
            escrow.buyer.as_ref(),
            escrow.seller.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];
        
        // Transfer tokens to seller
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.seller_token_account.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
                signer,
            ),
            escrow.amount,
        )?;
        
        escrow.status = EscrowStatus::Completed;
        Ok(())
    }

    pub fn refund_buyer(ctx: Context<RefundBuyer>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Active, EscrowError::InvalidStatus);
        
        let clock = Clock::get()?;
        require!(clock.unix_timestamp > escrow.timeout, EscrowError::TimeoutNotReached);
        
        let seeds = &[
            b"escrow",
            escrow.buyer.as_ref(),
            escrow.seller.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];
        
        // Refund tokens to buyer
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
                signer,
            ),
            escrow.amount,
        )?;
        
        escrow.status = EscrowStatus::Refunded;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Seller account
    pub seller: AccountInfo<'info>,
    #[account(
        init,
        payer = buyer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init,
        payer = buyer,
        token::mint = mint,
        token::authority = escrow,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    /// CHECK: Seller account
    pub seller: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundBuyer<'info> {
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    /// CHECK: Seller account
    pub seller: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub timeout: i64,
    pub status: EscrowStatus,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum EscrowStatus {
    Active,
    Completed,
    Refunded,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid escrow status")]
    InvalidStatus,
    #[msg("Timeout not reached")]
    TimeoutNotReached,
}