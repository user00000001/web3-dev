use anchor_lang::prelude::*;
use switchboard_on_demand::RandomnessAccountData;

use crate::{error::ErrorCode, LotteryData};

#[derive(Accounts)]
pub struct ChooseWinner<'info> {
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

pub fn choose_winner_(ctx: Context<ChooseWinner>) -> Result<()> {
    let clock = Clock::get()?;
    let lottery_data = &mut ctx.accounts.lottery_data;
    if lottery_data.randomness_account.key() != ctx.accounts.randomness_data.key() {
        return err!(ErrorCode::IncorrectRandomnessAccount);
    }
    if lottery_data.authority.key() != ctx.accounts.payer.key() {
        return err!(ErrorCode::NotAuthorized);
    }
    if clock.slot < lottery_data.lottery_end {
        return err!(ErrorCode::LotteryNotCompleted);
    }
    require!(lottery_data.winner_chosen == false, ErrorCode::WinnerChosen);
    let randomness_data =
        RandomnessAccountData::parse(ctx.accounts.randomness_data.data.borrow()).unwrap();
    let revealed_random_value = randomness_data
        .get_value(&clock)
        .map_err(|_| ErrorCode::RandomnessNotResolved)?;
    lottery_data.winner = revealed_random_value[0] as u64 % lottery_data.ticket_num;
    msg!(
        "Randomness-0: {}, Ticket Num: {}, Winner: {}",
        revealed_random_value[0],
        lottery_data.ticket_num,
        lottery_data.winner
    );
    lottery_data.winner_chosen = true;
    Ok(())
}
