#![allow(deprecated, unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("AFJpxWy8BSDnWS7RKuMPBbdb89GmhxzQzDxnbrw6Aj7X");

#[program]
pub mod anchor09_lottery {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        start: u64,
        end: u64,
        price: u64,
    ) -> Result<()> {
        initialize_config_(ctx, start, end, price)
    }

    pub fn initialize_lottery(ctx: Context<InitializeLottery>) -> Result<()> {
        initialize_lottery_(ctx)
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        buy_ticket_(ctx)
    }

    pub fn commit_winner(ctx: Context<CommitWinner>) -> Result<()> {
        commit_winner_(ctx)
    }

    pub fn choose_winner(ctx: Context<ChooseWinner>) -> Result<()> {
        choose_winner_(ctx)
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        claim_prize_(ctx)
    }
}
