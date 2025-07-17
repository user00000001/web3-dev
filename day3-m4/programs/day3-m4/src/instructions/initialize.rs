#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

use crate::TrueOrFalse;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + size_of::<TrueOrFalse>(),
        seeds = [],
        bump
    )]
    pub true_or_false: Account<'info, TrueOrFalse>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
