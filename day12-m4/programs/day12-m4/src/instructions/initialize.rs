#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::MyPDA;

#[derive(Accounts)]
pub struct Initialize<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + size_of::<MyPDA>(),
        seeds = [],
        bump,
    )]
    pub my_pda: Account<'info, MyPDA>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    ctx.accounts.my_pda.counter += 1;
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
