#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token_interface};

use crate::{error::ErrorCode, Bank, User};

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        mut,
        seeds = [mint.key().as_ref()],
        bump,
    )]
    pub bank_data: Account<'info, Bank>,
    #[account(
        mut,
        seeds = [b"treasury", mint.key().as_ref()],
        bump
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

pub fn repay_(ctx: Context<Repay>, amount: u64) -> Result<()> {
    let user_data = &mut ctx.accounts.user_data;
    let bank_data = &mut ctx.accounts.bank_data;
    let borrowed_asset: u64;
    match ctx.accounts.mint.to_account_info().key() {
        key if key == user_data.usdc_address => {
            borrowed_asset = user_data.borrowed_usdc;
        }
        _ => {
            borrowed_asset = user_data.borrowed_sol;
        }
    }
    if borrowed_asset < amount {
        return err!(ErrorCode::OverRepay);
    }
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
    if bank_data.total_borrowed == 0 {
        bank_data.total_borrowed = amount;
        bank_data.total_borrowed_shares = amount;
    }
    let borrow_ratio = amount.checked_div(bank_data.total_borrowed).unwrap();
    let user_shares = bank_data
        .total_borrowed_shares
        .checked_mul(borrow_ratio)
        .unwrap();
    bank_data.total_borrowed -= amount;
    bank_data.total_borrowed_shares -= user_shares;
    match ctx.accounts.mint.to_account_info().key() {
        key if key == user_data.usdc_address => {
            user_data.borrowed_usdc -= amount;
            user_data.deposited_usdc_shares -= user_shares;
        }
        _ => {
            user_data.borrowed_sol -= amount;
            user_data.borrowed_sol_shares -= user_shares;
        }
    }
    Ok(())
}
