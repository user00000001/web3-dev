#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4v7ZbzRSLSsoJYfqMQQCzVQLMtPWKbetnGxS3vU89V3D");

#[program]
pub mod day13_m4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn set(ctx: Context<Set>, new_value: u32) -> Result<()> {
        set_(ctx, new_value)
    }

    pub fn set_fails(ctx: Context<Set>, new_value: u32) -> Result<()> {
        set_fails_(ctx, new_value)
    }
}
