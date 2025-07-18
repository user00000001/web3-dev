#![allow(unexpected_cfgs, deprecated)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("8KDrr8oxYQGcasYFjYQbdW23uzJp51EKSYtKxv7urE8w");

#[program]
pub mod day5_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn incre_struct_size(ctx: Context<IncreStructSize>, incre_size: u64) -> Result<()> {
        incre_struct_size_(ctx, incre_size)
    }
}
