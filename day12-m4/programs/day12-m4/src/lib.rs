#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("2HVqLUHhNN1D5yqSRoNALj5byjZgVWFAjVgdb3iNDVSa");

#[program]
pub mod day12_m4 {
    use super::*;

    pub fn increment(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn drain_lamports(ctx: Context<DrainLamports>) -> Result<()> {
        drain_lamports_(ctx)
    }

    pub fn give_to_system_program(ctx: Context<GiveToSystemProgram>) -> Result<()> {
        give_to_system_program_(ctx)
    }

    pub fn initialize_insecure(ctx: Context<InitializeInsecure>) -> Result<()> {
        initialize_insecure_(ctx)
    }

    pub fn erase(ctx: Context<Erase>) -> Result<()> {
        erase_(ctx)
    }

    pub fn drain_erase_account_lamports(ctx: Context<Erase>) -> Result<()> {
        drain_erase_account_lamports_(ctx)
    }
}
