#![allow(unexpected_cfgs)]
use std::str::FromStr;

use anchor_lang::prelude::*;

use crate::MyStorage;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        address = Pubkey::from_str("24Z4Ed8MHb1nEkukxVAShwwi8dTh3WceKzr1xitNjMx8").unwrap(),
    )]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [],
        bump,
        //close = signer  // this field make this account to be closed.
    )]
    pub my_storage: Account<'info, MyStorage>,
}

pub fn withdraw_(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    ctx.accounts.my_storage.sub_lamports(amount)?;
    ctx.accounts.signer.add_lamports(amount)?;
    Ok(())
}
