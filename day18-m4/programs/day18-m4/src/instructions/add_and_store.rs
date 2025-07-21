#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::BobData;

#[derive(Accounts)]
pub struct BobAddOp<'info> {
    #[account(mut)]
    pub bob_data_account: Account<'info, BobData>,
}

pub fn add_and_store_(ctx: Context<BobAddOp>, a: u64, b: u64) -> Result<()> {
    let result = a + b;

    ctx.accounts.bob_data_account.result = result;
    Ok(())
}
