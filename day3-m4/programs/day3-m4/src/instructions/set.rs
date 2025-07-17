#![allow(unexpected_cfgs, deprecated)]

use anchor_lang::prelude::*;

use crate::TrueOrFalse;

#[derive(Accounts)]
pub struct Set<'info> {
    #[account(
        mut,
        seeds = [],
        bump
    )]
    pub true_or_false: Account<'info, TrueOrFalse>,
}

pub fn set_(ctx: Context<Set>, true_or_false: bool) -> Result<()> {
    let prev = ctx.accounts.true_or_false.true_or_false;
    ctx.accounts.true_or_false.true_or_false = true_or_false;
    msg!("set true_or_false from {} to {}", prev, true_or_false);
    Ok(())
}
