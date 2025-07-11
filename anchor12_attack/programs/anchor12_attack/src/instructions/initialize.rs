#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

use crate::Bank;

pub fn handler(ctx: Context<Initialize>, vault_address: Pubkey) -> Result<()> {
    *ctx.accounts.bank = Bank {
        authority: ctx.accounts.fake_authority.key(),
        vault: vault_address,
        is_initialized: true,
    };
    msg!("{:#?}", ctx.accounts.bank);
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub fake_authority: Signer<'info>,
    #[account(
        init,
        payer = fake_authority,
        space = 8 + Bank::INIT_SPACE,
        seeds = [b"bank"],
        bump,
    )]
    pub bank: Account<'info, Bank>,
    pub system_program: Program<'info, System>,
}
