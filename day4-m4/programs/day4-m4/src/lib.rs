#![allow(deprecated, unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("5ohreTMU8Hg4YGmEuzBtv1XVVj3Um7ckTKTSJSCHiTxF");

#[program]
pub mod day4_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String, key1: u64, key2: u64) -> Result<()> {
        initialize::handler(ctx, name, key1, key2)
    }

    pub fn set(ctx: Context<Set>, name: String, key1: u64, key2: u64, value: u64) -> Result<()> {
        set_(ctx, name, key1, key2, value)
    }
}
