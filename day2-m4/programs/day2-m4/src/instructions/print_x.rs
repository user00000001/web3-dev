#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

use crate::MyStorage;

#[derive(Accounts)]
pub struct PrintX<'info> {
    pub my_storage: Account<'info, MyStorage>,
}

pub fn print_x_(ctx: Context<PrintX>) -> Result<()> {
    msg!("x is: {}", ctx.accounts.my_storage.x);
    Ok(())
}
