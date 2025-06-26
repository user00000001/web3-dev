#![allow(deprecated)]
#![allow(unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("AaMggZ9ru74zUAEL2EURkGCpnXJKAqdX5AdxMBhKQQZB");

#[program]
pub mod anchor07_swap {
    use super::*;

    pub fn make_offer(
        ctx: Context<MakeOffer>,
        offer_id: u64,
        token_a_offered_amount: u64,
        want_token_b_amount: u64,
    ) -> Result<()> {
        make_offer_(ctx, offer_id, token_a_offered_amount, want_token_b_amount)
    }

    pub fn take_offer(ctx: Context<TakeOffer>) -> Result<()> {
        take_offer_(ctx)
    }
}
