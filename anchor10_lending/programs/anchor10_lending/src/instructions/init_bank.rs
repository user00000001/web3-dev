#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::token_interface;

use crate::Bank;

#[derive(Accounts)]
pub struct InitBank<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        init,
        payer = signer,
        space = 8 + Bank::INIT_SPACE,
        seeds = [mint.key().as_ref()],
        bump,
    )]
    pub bank_data: Account<'info, Bank>,
    #[account(
        init,
        payer = signer,
        token::mint = mint,
        token::authority = bank_token_account,
        seeds = [b"treasury", mint.key().as_ref()],
        bump,
    )]
    pub bank_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn init_bank_(ctx: Context<InitBank>, liquidation_threshold: u64, max_ltv: u64) -> Result<()> {
    let bank_data = &mut ctx.accounts.bank_data;
    bank_data.mint_address = ctx.accounts.mint.key();
    bank_data.authority = ctx.accounts.signer.key();
    bank_data.liquidation_threshold = liquidation_threshold;
    bank_data.max_ltv = max_ltv;
    Ok(())
}
