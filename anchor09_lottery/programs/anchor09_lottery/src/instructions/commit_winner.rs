use anchor_lang::prelude::*;
use switchboard_on_demand::RandomnessAccountData;

use crate::{error::ErrorCode, LotteryData};

#[derive(Accounts)]
pub struct CommitWinner<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"lottery_data"],
        bump = lottery_data.bump,
    )]
    pub lottery_data: Account<'info, LotteryData>,
    /// CHECK: Account will be checked in the invoked funciton.
    pub randomness_data: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn commit_winner_(ctx: Context<CommitWinner>) -> Result<()> {
    let clock = Clock::get()?;
    let lottery_data = &mut ctx.accounts.lottery_data;
    if lottery_data.authority.key() != ctx.accounts.payer.key() {
        return err!(ErrorCode::NotAuthorized);
    }
    let randomness_data =
        RandomnessAccountData::parse(ctx.accounts.randomness_data.data.borrow()).unwrap();
    if randomness_data.seed_slot != clock.slot - 1 {
        return err!(ErrorCode::RandomnessAlreadyRevealed);
    }
    lottery_data.randomness_account = ctx.accounts.randomness_data.key();
    Ok(())
}
