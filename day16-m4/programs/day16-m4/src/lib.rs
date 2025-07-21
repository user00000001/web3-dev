#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("3ez5XvqSw3WiSMwCEToxDRRxM7o7U3EyGg7kZNdadsRD");

#[program]
pub mod day16_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn foo(ctx: Context<Foo>) -> Result<()> {
        foo_(ctx)
    }

    pub fn hello(ctx: Context<Hello>) -> Result<()> {
        hello_(ctx)
    }
}
