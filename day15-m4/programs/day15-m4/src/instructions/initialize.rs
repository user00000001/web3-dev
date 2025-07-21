#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

use crate::Pda;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + size_of::<Pda>(),
        seeds = [],
        bump,
    )]
    pub pda: Account<'info, Pda>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
