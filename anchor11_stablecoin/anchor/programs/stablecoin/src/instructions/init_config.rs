#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::token_interface;

use crate::{
    constants::{
        LIQUIDATION_BONUS, LIQUIDATION_THRESHOLD, MINIMUM_HEALTH_FACTOR, MINT_DECIMALS,
        SEED_CONFIG, SEED_MINT_ACCOUNT,
    },
    state::SCConfig,
};

#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + SCConfig::INIT_SPACE,
        seeds = [SEED_CONFIG],
        bump
    )]
    pub config_data: Account<'info, SCConfig>,
    #[account(
        init,
        payer = authority,
        mint::decimals = MINT_DECIMALS,
        mint::authority = mint_account,
        mint::freeze_authority = mint_account,
        mint::token_program = token_program,
        seeds = [SEED_MINT_ACCOUNT],
        bump
    )]
    pub mint_account: InterfaceAccount<'info, token_interface::Mint>,
    pub token_program: Program<'info, token_interface::Token2022>,
    pub system_program: Program<'info, System>,
}

pub fn init_config_(ctx: Context<InitConfig>) -> Result<()> {
    *ctx.accounts.config_data = SCConfig {
        authority: ctx.accounts.authority.key(),
        mint_account: ctx.accounts.mint_account.key(),
        liquidation_threshold: LIQUIDATION_THRESHOLD,
        liquidation_bonus: LIQUIDATION_BONUS,
        min_health_factor: MINIMUM_HEALTH_FACTOR,
        bump: ctx.bumps.config_data,
        bump_mint_account: ctx.bumps.mint_account,
    };
    msg!("Initialized Config: {:#?}", ctx.accounts.config_data);
    Ok(())
}
