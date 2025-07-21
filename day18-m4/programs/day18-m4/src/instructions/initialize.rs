#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::BobData;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + size_of::<BobData>(),
        seeds = [],
        bump
    )]
    pub bob_data_account: Account<'info, BobData>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
