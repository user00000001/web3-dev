#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::MyPda;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = size_of::<MyPda>() + 8,
        seeds = [],
        bump,
    )]
    pub my_pda: Account<'info, MyPda>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}

#[derive(Accounts)]
pub struct InitializedByKeypair<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = size_of::<MyPda>() + 8,
    )]
    pub my_pda: Account<'info, MyPda>,
    pub system_program: Program<'info, System>,
}

pub fn initialized_by_keypair_(_ctx: Context<InitializedByKeypair>) -> Result<()> {
    Ok(())
}
