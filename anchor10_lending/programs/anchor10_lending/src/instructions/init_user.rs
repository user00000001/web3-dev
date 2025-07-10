#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::User;

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + User::INIT_SPACE,
        seeds = [signer.key().as_ref()],
        bump,
    )]
    pub user_data: Account<'info, User>,
    pub system_program: Program<'info, System>,
}

pub fn init_user_(ctx: Context<InitUser>, usdc_address: Pubkey) -> Result<()> {
    let user_data = &mut ctx.accounts.user_data;
    user_data.owner = ctx.accounts.signer.key();
    user_data.usdc_address = usdc_address;
    let now = Clock::get()?.unix_timestamp;
    user_data.last_updated = now;
    Ok(())
}
