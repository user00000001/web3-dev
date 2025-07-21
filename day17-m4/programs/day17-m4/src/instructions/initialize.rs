#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

use crate::Storage;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + size_of::<Storage>(),
        seeds = [],
        bump
    )]
    pub storage: Account<'info, Storage>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    if ctx.accounts.storage.x == 0 {
        ctx.accounts.storage.x = 9 + 8 * 2u64.pow(32);
    }
    Ok(())
}
