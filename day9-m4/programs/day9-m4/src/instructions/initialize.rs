use anchor_lang::prelude::*;

use crate::MyStorage;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + size_of::<MyStorage>(),
        seeds = [],
        bump
    )]
    pub my_storage: Account<'info, MyStorage>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateValue<'info> {
    #[account(mut)]
    pub fren: Signer<'info>,
    #[account(
        mut,
        seeds = [],
        bump
    )]
    pub my_storage: Account<'info, MyStorage>,
}

pub fn update_value_(ctx: Context<UpdateValue>, x: u64) -> Result<()> {
    ctx.accounts.my_storage.x = x;
    Ok(())
}
