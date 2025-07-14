#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

use crate::{constants::SEED_CONFIG, state::SCConfig};

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [SEED_CONFIG],
        bump = config_data.bump,
    )]
    pub config_data: Account<'info, SCConfig>,
}

pub fn update_config_(ctx: Context<UpdateConfig>, minimum_health_factor: u64) -> Result<()> {
    ctx.accounts.config_data.min_health_factor = minimum_health_factor;
    msg!("{:#?}", ctx.accounts.config_data);
    Ok(())
}
