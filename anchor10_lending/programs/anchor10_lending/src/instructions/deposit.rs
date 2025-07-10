#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token_interface};

use crate::{Bank, User};

#[derive(Accounts)]
pub struct Deposit<'info> {
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
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn deposit_(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    token_interface::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.user_token_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.bank_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.mint.decimals,
    )?;
    let bank_data = &mut ctx.accounts.bank_data;
    if bank_data.total_deposits == 0 {
        bank_data.total_deposits = amount;
        bank_data.total_deposit_shares = amount;
    }
    // ???, not enough amount leads to zero shares?
    let deposit_ratio = amount.checked_div(bank_data.total_deposits).unwrap();
    let user_shares = bank_data
        .total_deposit_shares
        .checked_mul(deposit_ratio)
        .unwrap();

    let user_data = &mut ctx.accounts.user_data;
    match ctx.accounts.mint.to_account_info().key() {
        key if key == user_data.usdc_address => {
            user_data.deposited_usdc += amount;
            user_data.deposited_usdc_shares += user_shares;
        }
        _ => {
            user_data.deposited_sol += amount;
            user_data.deposited_sol_shares += user_shares;
        }
    }

    bank_data.total_deposits += amount;
    bank_data.total_deposit_shares += user_shares;
    user_data.last_updated = Clock::get()?.unix_timestamp;
    Ok(())
}
