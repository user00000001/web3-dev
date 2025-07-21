#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

use crate::{error::ErrorCode, Pda};

#[derive(Accounts)]
pub struct Set<'info> {
    #[account(mut)]
    pub pda: Account<'info, Pda>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn set_(ctx: Context<Set>, new_value: u32) -> Result<()> {
    ctx.accounts.pda.value = new_value;
    Ok(())
}

pub fn set_fails_(ctx: Context<Set>, new_value: u32) -> Result<()> {
    ctx.accounts.pda.value = new_value;
    return err!(ErrorCode::AlwaysFails);
}
