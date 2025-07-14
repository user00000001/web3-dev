#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("6eQX1B4QWMz98S3DEiNK89JriqZXTCYRtVCartioHTgi");

#[program]
pub mod day2 {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        a: u64,
        b: u64,
        c: String,
        d: Vec<u64>,
        e: f32,
    ) -> Result<()> {
        initialize::handler(ctx, a, b, c, d, e)
    }
}
