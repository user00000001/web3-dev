#![allow(unexpected_cfgs, deprecated)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Hrz39jkujADGtXixCEokt1XTLmnZ2C3jmZKmwD1e7Tx9");

#[program]
pub mod day9_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn update_value(ctx: Context<UpdateValue>, x: u64) -> Result<()> {
        update_value_(ctx, x)
    }

    pub fn init_player(ctx: Context<InitPlayer>) -> Result<()> {
        init_player_(ctx)
    }

    pub fn transfer_points(ctx: Context<TransferPoints>, amount: u64) -> Result<()> {
        transfer_points_(ctx, amount)
    }
}
