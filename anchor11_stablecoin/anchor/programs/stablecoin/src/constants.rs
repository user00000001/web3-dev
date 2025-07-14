use anchor_lang::prelude::*;

#[constant]
pub const SEED_CONFIG: &[u8] = b"config";
#[constant]
pub const SEED_COLLATERAL: &[u8] = b"collateral";
#[constant]
pub const SEED_SOL_ACCOUNT: &[u8] = b"sol";
#[constant]
pub const SEED_MINT_ACCOUNT: &[u8] = b"mint";

#[constant]
pub const SOL_PRICE_FEED_ID: &str =
    "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
#[constant]
pub const MAXIMUM_AGE: u64 = 1e3 as u64;
#[constant]
pub const PRICE_FEED_DECIMAL_ADJUSTMENT: u128 = 10;

#[constant]
pub const LIQUIDATION_THRESHOLD: u64 = 50;
#[constant]
pub const LIQUIDATION_BONUS: u64 = 10;
#[constant]
pub const MINIMUM_HEALTH_FACTOR: u64 = 1;
#[constant]
pub const MINT_DECIMALS: u8 = 9;
