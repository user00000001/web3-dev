#![allow(unexpected_cfgs, deprecated)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("22686SG7MMppP1QhsFZ8hVNAfLAB8cPpM9VzA4XUzV3L");

#[program]
pub mod day15_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn close(ctx: Context<Close>) -> Result<()> {
        close_(ctx)
    }
}
