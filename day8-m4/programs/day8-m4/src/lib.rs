#![allow(deprecated, unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("F5pwEorV6oQ1iGVuAtbT4qtZkaDC4YxNuTxvgTiAeG72");

#[program]
pub mod day8_m4 {
    use super::*;

    pub fn send_sola(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        initialize::handler(ctx, amount)
    }

    pub fn split_sol<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, SplitSol<'info>>,
        amount: u64,
    ) -> Result<()> {
        split_sol_(ctx, amount)
    }
}
