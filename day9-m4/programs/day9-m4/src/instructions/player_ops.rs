#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::{error::ErrorCode, Player};

const DEFAULT_POINTS: u64 = 10;

#[derive(Accounts)]
pub struct InitPlayer<'info> {
    #[account(
        init,
        payer = signer,
        space = size_of::<Player>() + 8,
        seeds = [signer.key().as_ref()],
        bump,
    )]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn init_player_(ctx: Context<InitPlayer>) -> Result<()> {
    ctx.accounts.player.points = DEFAULT_POINTS;
    ctx.accounts.player.authority = ctx.accounts.signer.key();
    Ok(())
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct TransferPoints<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    //pub signer: Signer<'info>,
    #[account(
        mut,
        has_one = authority @ ErrorCode::SignerIsNotAuthority,
        constraint = from.points >= amount @ ErrorCode::InsufficientPoints,
    )]
    pub from: Account<'info, Player>,
    #[account(mut)]
    pub to: Account<'info, Player>,
}

pub fn transfer_points_(ctx: Context<TransferPoints>, amount: u64) -> Result<()> {
    //require!(
    //    ctx.accounts.from.authority == ctx.accounts.signer.key(),
    //    ErrorCode::SignerIsNotAuthority
    //);
    //require!(
    //    ctx.accounts.from.points >= amount,
    //    ErrorCode::InsufficientPoints
    //);
    ctx.accounts.from.points -= amount;
    ctx.accounts.to.points += amount;
    Ok(())
}
