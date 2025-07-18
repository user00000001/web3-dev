#![allow(unexpected_cfgs, deprecated)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("tqwki9A9M1WsCAe9bMR92ZqjqeqtCezXezMf3H49PoX");

#[program]
pub mod day6_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
