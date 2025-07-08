#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::LotteryData;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + LotteryData::INIT_SPACE,
        seeds = [b"lottery_data"],
        bump
    )]
    pub lottery_data: Account<'info, LotteryData>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_config_(
    ctx: Context<InitializeConfig>,
    start: u64,
    end: u64,
    price: u64,
) -> Result<()> {
    *ctx.accounts.lottery_data = LotteryData {
        winner: 0,
        winner_chosen: false,
        lottery_start: start,
        lottery_end: end,
        lottery_pot_amount: 0,
        price,
        randomness_account: Pubkey::default(),
        authority: ctx.accounts.payer.key(),
        ticket_num: 0,
        bump: ctx.bumps.lottery_data,
    };
    Ok(())
}
