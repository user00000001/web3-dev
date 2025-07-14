use crate::{utils::*, Collateral, SCConfig, SEED_COLLATERAL, SEED_CONFIG};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, Token2022, TokenAccount};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

#[derive(Accounts)]
pub struct RedeemCollateralAndBurnTokens<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    pub price_update: Account<'info, PriceUpdateV2>,
    #[account(
        seeds = [SEED_CONFIG],
        bump = config_data.bump,
        has_one = mint_account
    )]
    pub config_data: Account<'info, SCConfig>,
    #[account(
        mut,
        seeds = [SEED_COLLATERAL, depositor.key().as_ref()],
        bump = collateral_data.bump,
        has_one = sol_account,
        has_one = token_account
    )]
    pub collateral_data: Account<'info, Collateral>,
    #[account(mut)]
    pub sol_account: SystemAccount<'info>,
    #[account(mut)]
    pub mint_account: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

// https://github.com/Cyfrin/foundry-defi-stablecoin-cu/blob/main/src/DSCEngine.sol#L157
pub fn redeem_collateral_and_burn_tokens_(
    ctx: Context<RedeemCollateralAndBurnTokens>,
    amount_collateral: u64,
    amount_to_burn: u64,
) -> Result<()> {
    let collateral_data = &mut ctx.accounts.collateral_data;
    collateral_data.lamport_balance = ctx.accounts.sol_account.lamports() - amount_collateral;
    collateral_data.amount_minted -= amount_to_burn;

    check_health_factor(
        &ctx.accounts.collateral_data,
        &ctx.accounts.config_data,
        &ctx.accounts.price_update,
    )?;

    burn_tokens_internal(
        &ctx.accounts.mint_account,
        &ctx.accounts.token_account,
        &ctx.accounts.depositor,
        &ctx.accounts.token_program,
        amount_to_burn,
    )?;

    withdraw_sol_internal(
        &ctx.accounts.sol_account,
        &ctx.accounts.depositor.to_account_info(),
        &ctx.accounts.system_program,
        &ctx.accounts.depositor.key(),
        ctx.accounts.collateral_data.bump_sol_account,
        amount_collateral,
    )?;

    Ok(())
}
