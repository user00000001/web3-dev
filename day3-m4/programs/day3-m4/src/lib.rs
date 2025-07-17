#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("E2fS9GNp3a78X7bCfWTgzsvWgj8dfTgqkuuDUqyHZDq9");

#[program]
pub mod day3_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn set(ctx: Context<Set>, true_or_false: bool) -> Result<()> {
        set_(ctx, true_or_false)
    }
}
