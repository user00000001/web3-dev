#![allow(unexpected_cfgs, deprecated)]

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    pub signer: Signer<'info>,
    pub account: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct Empty {}

pub fn add_(ctx: Context<Initialize>, a: u64, b: u64) -> Result<()> {
    let sum = a + b;
    msg!("Greetings from: {:?}, {}", ctx.program_id, sum);
    Ok(())
}

pub fn sub_(ctx: Context<Empty>, a: u64, b: u64) -> Result<()> {
    let difference = a.checked_sub(b);
    msg!("Greetings from: {:?}, {:#?}", ctx.program_id, difference);
    Ok(())
}
