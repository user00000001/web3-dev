#![allow(deprecated, unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("7GqnWkivGMgSjWBeDhddYYn3ym5VNY7Ep3vdoDPy6bCF");

#[program]
pub mod day4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, a: u64) -> Result<()> {
        initialize::handler(ctx, a)
    }
}
