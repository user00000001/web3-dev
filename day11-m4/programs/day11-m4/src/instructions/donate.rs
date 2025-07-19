#![allow(unexpected_cfgs)]
use anchor_lang::{prelude::*, system_program};

use crate::MyStorage;

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [],
        bump
    )]
    pub my_storage: Account<'info, MyStorage>,
    pub system_program: Program<'info, System>,
}

pub fn donate_(ctx: Context<Donate>, amount: u64) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.signer.to_account_info(),
                to: ctx.accounts.my_storage.to_account_info(),
            },
        ),
        amount,
    )?;
    Ok(())
}
