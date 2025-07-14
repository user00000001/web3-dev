#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

mod constants;
mod error;
mod instructions;
mod state;
mod utils;

use constants::*;
use instructions::*;
use state::*;

declare_id!("BsjcJ9E8CS5BMvP2VLErNUMiFSLVP9u2hifKLdYJtJE7");

#[program]
pub mod stablecoin {
    use super::*;

    pub fn init_config(ctx: Context<InitConfig>) -> Result<()> {
        init_config_(ctx)
    }

    pub fn update_config(ctx: Context<UpdateConfig>, minimum_health_factor: u64) -> Result<()> {
        update_config_(ctx, minimum_health_factor)
    }

    pub fn deposit_collateral_and_mint_tokens(
        ctx: Context<DepositCollateralAndMintTokens>,
        amount_collateral: u64,
        amount_to_mint: u64,
    ) -> Result<()> {
        deposit_collateral_and_mint_tokens_(ctx, amount_collateral, amount_to_mint)
    }

    pub fn redeem_collateral_and_burn_tokens(
        ctx: Context<RedeemCollateralAndBurnTokens>,
        amount_collateral: u64,
        amount_to_burn: u64,
    ) -> Result<()> {
        redeem_collateral_and_burn_tokens_(ctx, amount_collateral, amount_to_burn)
    }

    pub fn liquidate(ctx: Context<Liquidate>, amount_to_burn: u64) -> Result<()> {
        liquidate_(ctx, amount_to_burn)
    }
}
