use crate::{error::ErrorCode, utils::*, Collateral, SCConfig, SEED_CONFIG};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, Token2022, TokenAccount};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,

    pub price_update: Account<'info, PriceUpdateV2>,
    #[account(
        seeds = [SEED_CONFIG],
        bump = config_data.bump,
        has_one = mint_account
    )]
    pub config_data: Account<'info, SCConfig>,
    #[account(
        mut,
        has_one = sol_account
    )]
    pub collateral_data: Account<'info, Collateral>,
    #[account(mut)]
    pub sol_account: SystemAccount<'info>,
    #[account(mut)]
    pub mint_account: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = liquidator,
        associated_token::token_program = token_program
    )]
    pub token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

// https://github.com/Cyfrin/foundry-defi-stablecoin-cu/blob/main/src/DSCEngine.sol#L215
pub fn liquidate_(ctx: Context<Liquidate>, amount_to_burn: u64) -> Result<()> {
    let health_factor = calculate_health_factor(
        &ctx.accounts.collateral_data,
        &ctx.accounts.config_data,
        &ctx.accounts.price_update,
    )?;

    require!(
        //??? wrong < condition.
        health_factor >= ctx.accounts.config_data.min_health_factor,
        ErrorCode::AboveMinimumHealthFactor
    );

    let lamports = get_lamports_from_usd(&amount_to_burn, &ctx.accounts.price_update)?;
    let liquidation_bonus = lamports * ctx.accounts.config_data.liquidation_bonus / 100;
    let amount_to_liquidate = lamports + liquidation_bonus;

    msg!("*** LIQUIDATION ***");
    msg!("Bonus {}%", ctx.accounts.config_data.liquidation_bonus);
    msg!("Bonus Amount  : {:.9}", liquidation_bonus as f64 / 1e9);
    msg!("SOL Liquidated: {:.9}", amount_to_liquidate as f64 / 1e9);

    withdraw_sol_internal(
        &ctx.accounts.sol_account,
        &ctx.accounts.liquidator.to_account_info(),
        &ctx.accounts.system_program,
        &ctx.accounts.collateral_data.depositor,
        ctx.accounts.collateral_data.bump_sol_account,
        amount_to_liquidate,
    )?;

    burn_tokens_internal(
        &ctx.accounts.mint_account,
        &ctx.accounts.token_account,
        &ctx.accounts.liquidator,
        &ctx.accounts.token_program,
        amount_to_burn,
    )?;

    let collateral_data = &mut ctx.accounts.collateral_data;
    collateral_data.lamport_balance = ctx.accounts.sol_account.lamports();
    collateral_data.amount_minted -= amount_to_burn;

    // Optional, logs new health factor
    calculate_health_factor(
        &ctx.accounts.collateral_data,
        &ctx.accounts.config_data,
        &ctx.accounts.price_update,
    )?;
    Ok(())
}
