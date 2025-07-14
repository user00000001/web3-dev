#![allow(unexpected_cfgs)]
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token_interface};
use pyth_solana_receiver_sdk::price_update;

use crate::{
    constants::{SEED_COLLATERAL, SEED_CONFIG, SEED_SOL_ACCOUNT},
    state::{Collateral, SCConfig},
};

#[derive(Accounts)]
pub struct DepositCollateralAndMintTokens<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,
    #[account(
        mut,
        seeds = [SEED_CONFIG],
        bump = config_data.bump,
        has_one = mint_account
    )]
    pub config_data: Account<'info, SCConfig>,
    #[account(
        init_if_needed,
        payer = depositor,
        space = 8 + Collateral::INIT_SPACE,
        seeds = [SEED_COLLATERAL, depositor.key().as_ref()],
        bump,
    )]
    pub collateral_data: Account<'info, Collateral>,
    #[account(
        mut,
        seeds = [SEED_SOL_ACCOUNT, depositor.key().as_ref()],
        bump
    )]
    pub sol_account: SystemAccount<'info>,
    #[account(mut)]
    pub mint_account: InterfaceAccount<'info, token_interface::Mint>,
    pub price_update: Account<'info, price_update::PriceUpdateV2>,
    #[account(
        init_if_needed,
        payer = depositor,
        associated_token::mint = mint_account,
        associated_token::authority = depositor,
        associated_token::token_program = token_program,
    )]
    pub token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub token_program: Program<'info, token_interface::Token2022>,
    pub system_program: Program<'info, System>,
}

pub fn deposit_collateral_and_mint_tokens_(
    ctx: Context<DepositCollateralAndMintTokens>,
    amount_collateral: u64,
    amount_to_mint: u64,
) -> Result<()> {
    let collateral_data = &mut ctx.accounts.collateral_data;
    collateral_data.lamport_balance = amount_collateral + ctx.accounts.sol_account.lamports();
    collateral_data.amount_minted += amount_to_mint;
    if !collateral_data.initialized {
        collateral_data.initialized = true;
        collateral_data.sol_account = ctx.accounts.sol_account.key();
        collateral_data.depositor = ctx.accounts.depositor.key();
        collateral_data.token_account = ctx.accounts.token_account.key();
        collateral_data.bump = ctx.bumps.collateral_data;
        collateral_data.bump_sol_account = ctx.bumps.sol_account;
    }

    check_health_factor(
        &ctx.accounts.collateral_data,
        &ctx.accounts.config_data,
        &ctx.accounts.price_update,
    )?;

    deposit_sol_internal(
        &ctx.accounts.depositor,
        &ctx.accounts.sol_account,
        &ctx.accounts.system_program,
        amount_collateral,
    )?;

    mint_tokens_internal(
        &ctx.accounts.mint_account,
        &ctx.accounts.token_account,
        &ctx.accounts.token_program,
        ctx.accounts.config_data.bump_mint_account,
        amount_to_mint,
    )?;
    Ok(())
}
