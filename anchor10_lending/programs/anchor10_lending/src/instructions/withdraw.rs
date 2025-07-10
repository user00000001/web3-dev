use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token_interface};

use crate::{error::ErrorCode, Bank, User};

#[derive(Accounts)]
pub struct WithDraw<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        mut,
        seeds = [mint.key().as_ref()],
        bump
    )]
    pub bank_data: Account<'info, Bank>,
    #[account(
        mut,
        seeds = [b"treasury", mint.key().as_ref()],
        bump,
    )]
    pub bank_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    #[account(
        mut,
        seeds = [signer.key().as_ref()],
        bump,
    )]
    pub user_data: Account<'info, User>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn withdraw_(ctx: Context<WithDraw>, amount: u64) -> Result<()> {
    let user_data = &mut ctx.accounts.user_data;
    let deposited_value;
    if ctx.accounts.mint.to_account_info().key() == user_data.usdc_address {
        deposited_value = user_data.deposited_usdc;
    } else {
        deposited_value = user_data.deposited_sol;
    }
    if amount > deposited_value {
        return err!(ErrorCode::InsufficientFunds);
    }
    let mint_key = ctx.accounts.mint.key();
    let signers_seeds: &[&[&[u8]]] = &[&[
        b"treasury",
        mint_key.as_ref(),
        &[ctx.bumps.bank_token_account],
    ]];
    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.bank_token_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.bank_token_account.to_account_info(),
            },
            signers_seeds,
        ),
        amount,
        ctx.accounts.mint.decimals,
    )?;
    let bank_data = &mut ctx.accounts.bank_data;
    let shares_to_remove =
        (amount as f64 / bank_data.total_deposits as f64) * bank_data.total_deposit_shares as f64;

    if ctx.accounts.mint.to_account_info().key() == user_data.usdc_address {
        user_data.deposited_usdc -= amount;
        user_data.deposited_usdc_shares -= shares_to_remove as u64;
    } else {
        user_data.deposited_sol -= amount;
        user_data.deposited_sol_shares -= shares_to_remove as u64;
    }
    bank_data.total_deposits -= amount;
    bank_data.total_deposit_shares -= shares_to_remove as u64;
    Ok(())
}
