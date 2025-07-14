use crate::{
    constants::{SEED_MINT_ACCOUNT, SEED_SOL_ACCOUNT},
    error::ErrorCode,
    Collateral, SCConfig, MAXIMUM_AGE, PRICE_FEED_DECIMAL_ADJUSTMENT, SOL_PRICE_FEED_ID,
};
use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL, system_program};
use anchor_spl::token_interface;
use pyth_solana_receiver_sdk::price_update;

pub fn mint_tokens_internal<'info>(
    mint_account: &InterfaceAccount<'info, token_interface::Mint>,
    token_account: &InterfaceAccount<'info, token_interface::TokenAccount>,
    token_program: &Program<'info, token_interface::Token2022>,
    bump: u8,
    amount: u64,
) -> Result<()> {
    let signer_seeds: &[&[&[u8]]] = &[&[SEED_MINT_ACCOUNT, &[bump]]];

    token_interface::mint_to(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            token_interface::MintTo {
                mint: mint_account.to_account_info(),
                to: token_account.to_account_info(),
                authority: mint_account.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )
}

pub fn deposit_sol_internal<'info>(
    from: &Signer<'info>,
    to: &SystemAccount<'info>,
    system_program: &Program<'info, System>,
    amount: u64,
) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            system_program.to_account_info(),
            system_program::Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
            },
        ),
        amount,
    )
}

pub fn withdraw_sol_internal<'info>(
    from: &SystemAccount<'info>,
    to: &AccountInfo<'info>,
    system_program: &Program<'info, System>,
    depositor_key: &Pubkey,
    bump: u8,
    amount: u64,
) -> Result<()> {
    let signer_seeds: &[&[&[u8]]] = &[&[SEED_SOL_ACCOUNT, depositor_key.as_ref(), &[bump]]];

    system_program::transfer(
        CpiContext::new_with_signer(
            system_program.to_account_info(),
            system_program::Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )
}

pub fn burn_tokens_internal<'info>(
    mint_account: &InterfaceAccount<'info, token_interface::Mint>,
    token_account: &InterfaceAccount<'info, token_interface::TokenAccount>,
    authority: &Signer<'info>,
    token_program: &Program<'info, token_interface::Token2022>,
    amount: u64,
) -> Result<()> {
    token_interface::burn(
        CpiContext::new(
            token_program.to_account_info(),
            token_interface::Burn {
                mint: mint_account.to_account_info(),
                from: token_account.to_account_info(),
                authority: authority.to_account_info(),
            },
        ),
        amount,
    )
}

// Check health factor for Collateral account is greater than minimum required health factor
pub fn check_health_factor(
    collateral: &Account<Collateral>,
    config: &Account<SCConfig>,
    price_feed: &Account<price_update::PriceUpdateV2>,
) -> Result<()> {
    let health_factor = calculate_health_factor(collateral, config, price_feed)?;
    require!(
        health_factor >= config.min_health_factor,
        ErrorCode::BelowMinimumHealthFactor
    );
    Ok(())
}

// Calcuate health factor for a given Collateral account
pub fn calculate_health_factor(
    collateral: &Account<Collateral>,
    config: &Account<SCConfig>,
    price_feed: &Account<price_update::PriceUpdateV2>,
) -> Result<u64> {
    // Get the collateral value in USD
    // Assuming 1 SOL = $1.00 and $1 = 1_000_000_000
    // Example: get_usd_value(1_000_000_000 lamports, price_feed)
    // collateral_value_in_usd = 1_000_000_000
    let collateral_value_in_usd = get_usd_value(&collateral.lamport_balance, price_feed)?;

    // Adjust the collateral value for the liquidation threshold (require overcollateralize)
    // Example: (1_000_000_000 * 50) / 100 = 500_000_000
    let collateral_adjusted_for_liquidation_threshold =
        (collateral_value_in_usd * config.liquidation_threshold) / 100;

    msg!(
        "Minted Amount : {:.9}",
        collateral.amount_minted as f64 / 1e9
    );

    if collateral.amount_minted == 0 {
        msg!("Health Factor Max");
        return Ok(u64::MAX);
    }

    // Calculate the health factor
    // Ratio of (adjusted collateral value) / (amount stablecoins minted)
    // Example: 500_000_000 / 500_000_000 = 1
    let health_factor = (collateral_adjusted_for_liquidation_threshold) / collateral.amount_minted;

    msg!("Health Factor : {}", health_factor);
    Ok(health_factor)
}

// Given lamports, return USD value based on current SOL price.
fn get_usd_value(
    amount_in_lamports: &u64,
    price_feed: &Account<price_update::PriceUpdateV2>,
) -> Result<u64> {
    let feed_id = price_update::get_feed_id_from_hex(SOL_PRICE_FEED_ID)?;
    let price = price_feed.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &feed_id)?;

    // Check price is positive
    require!(price.price > 0, ErrorCode::InvalidPrice);

    // Adjust price to match lamports precision (9 decimals)
    // Example: Assuming 1 SOL = $2.00
    // price.price = 200_000_000 (from Pyth, 8 decimals)
    // price_in_usd = 200_000_000 * 10 = 2_000_000_000 (9 decimals)
    let price_in_usd = price.price as u128 * PRICE_FEED_DECIMAL_ADJUSTMENT;

    // Calculate USD value
    // Example: Convert 0.5 SOL to USD when 1 SOL = $2.00
    // amount_in_lamports = 500_000_000 (0.5 SOL)
    // price_in_usd = 2_000_000_000 (as calculated above)
    // LAMPORTS_PER_SOL = 1_000_000_000
    // amount_in_usd = (500_000_000 * 2_000_000_000) / 1_000_000_000 = 1_000_000_000 ($1.00)
    let amount_in_usd = (*amount_in_lamports as u128 * price_in_usd) / (LAMPORTS_PER_SOL as u128);

    // EXAMPLE LOGS
    // Program log: Price in USD (for 1 SOL): 136.194634200
    // Program log: SOL Amount: 0.500000000
    // Program log: USD Value: 68.097317100
    // Program log: Outstanding Token Amount (Minted): 1.500000000
    // Program log: Health Factor: 22
    msg!("*** CONVERT USD TO SOL ***");
    msg!("SOL/USD Price : {:.9}", price_in_usd as f64 / 1e9);
    msg!("SOL Amount    : {:.9}", *amount_in_lamports as f64 / 1e9);
    msg!("USD Value     : {:.9}", amount_in_usd as f64 / 1e9);
    // msg!("Price exponent?: {}", price.exponent);

    Ok(amount_in_usd as u64)
}

// Given USD amount, return lamports based on current SOL price
pub fn get_lamports_from_usd(
    amount_in_usd: &u64,
    price_feed: &Account<price_update::PriceUpdateV2>,
) -> Result<u64> {
    let feed_id = price_update::get_feed_id_from_hex(SOL_PRICE_FEED_ID)?;
    let price = price_feed.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &feed_id)?;

    // Check price is positive
    require!(price.price > 0, ErrorCode::InvalidPrice);

    // Adjust price to match lamports precision (9 decimals)
    // Example: Assuming 1 SOL = $2.00
    // price.price = 200_000_000 (from Pyth, 8 decimals)
    // price_in_usd = 200_000_000 * 10 = 2_000_000_000 (9 decimals)
    let price_in_usd = price.price as u128 * PRICE_FEED_DECIMAL_ADJUSTMENT;

    // Calculate lamports
    // Example: Convert $0.50 to lamports when 1 SOL = $2.00
    // amount_in_usd = 500_000_000 (user input, 9 decimals for $0.50)
    // LAMPORTS_PER_SOL = 1_000_000_000
    // price_in_usd = 2_000_000_000 (as calculated above)
    // amount_in_lamports = (500_000_000 * 1_000_000_000) / 2_000_000_000 = 250_000_000 (0.25 SOL)
    let amount_in_lamports = ((*amount_in_usd as u128) * (LAMPORTS_PER_SOL as u128)) / price_in_usd;

    // EXAMPLE LOGS
    // Program log: *** CONVERT SOL TO USD ***
    // Program log: Price in USD (for 1 SOL): 136.194634200
    // Program log: USD Amount: 1.500000000
    // Program log: SOL Value: 0.011013649
    msg!("*** CONVERT SOL TO USD ***");
    msg!("SOL/USD Price : {:.9}", price_in_usd as f64 / 1e9);
    msg!("USD Amount    : {:.9}", *amount_in_usd as f64 / 1e9);
    msg!("SOL Value     : {:.9}", amount_in_lamports as f64 / 1e9);

    Ok(amount_in_lamports as u64)
}
