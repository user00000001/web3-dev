#![allow(deprecated, unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("5AgzpwBursZLTGtkR8LwAf6PaZnf6fJ7Yaztu6711vzZ");

#[program]
pub mod day3 {
    use super::*;

    pub fn add(ctx: Context<Initialize>, a: u64, b: u64) -> Result<()> {
        add_(ctx, a, b)
    }

    pub fn sub(ctx: Context<Empty>, a: u64, b: u64) -> Result<()> {
        sub_(ctx, a, b)
    }
}
