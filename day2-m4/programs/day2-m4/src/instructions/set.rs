#![allow(unexpected_cfgs, deprecated)]
use crate::MyStorage;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Set<'info> {
    #[account(
        mut,
        seeds = [],
        bump
    )]
    pub my_storage: Account<'info, MyStorage>,
}

pub fn set_(ctx: Context<Set>, x: u64) -> Result<()> {
    let prev = ctx.accounts.my_storage.x;
    ctx.accounts.my_storage.x = x;
    msg!("set x from {} to {}", prev, x);
    Ok(())
}
