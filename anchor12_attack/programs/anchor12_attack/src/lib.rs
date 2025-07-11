#![allow(unexpected_cfgs, deprecated)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("HT3PBNuw5YR9ZPvzVdFR6cnUPjcQ6Y5BeLzMeaX4MTY5");

#[program]
pub mod anchor12_attack {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, vault_address: Pubkey) -> Result<()> {
        initialize::handler(ctx, vault_address)
    }
}
