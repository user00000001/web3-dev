#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BhdWuoiDiL65PQNxehn8PyP3pB9GotZgz9Pyg38vpnH8");

#[program]
pub mod day10_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn initialized_by_keypair(ctx: Context<InitializedByKeypair>) -> Result<()> {
        initialized_by_keypair_(ctx)
    }
}
