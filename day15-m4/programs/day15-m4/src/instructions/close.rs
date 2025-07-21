#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::Pda;

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        close = signer,
    )]
    pub pda: Account<'info, Pda>,
}

pub fn close_(_ctx: Context<Close>) -> Result<()> {
    Ok(())
}
