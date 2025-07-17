#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("7NkAxTkpSXTrYeFsVTEj5kSTLr8SScgDiXnG9JJT44Gx");

#[program]
pub mod day2_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn set(ctx: Context<Set>, x: u64) -> Result<()> {
        set_(ctx, x)
    }

    pub fn print_x(ctx: Context<PrintX>) -> Result<()> {
        print_x_(ctx)
    }
}
