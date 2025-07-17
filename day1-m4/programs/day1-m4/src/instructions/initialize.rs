#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

use crate::MyStorage;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + size_of::<MyStorage>(),
        seeds = [b"my_storage", signer.key().as_ref()],
        bump
    )]
    pub my_storage: Account<'info, MyStorage>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
