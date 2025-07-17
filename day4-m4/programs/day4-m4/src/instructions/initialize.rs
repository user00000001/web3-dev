use anchor_lang::prelude::*;

use crate::val::Val;

#[derive(Accounts)]
#[instruction(name: String, key1: u64, key2: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + size_of::<Val>(),
        seeds = [name.as_bytes(), key1.to_le_bytes().as_ref(), key2.to_le_bytes().as_ref()],
        bump,
    )]
    pub val: Account<'info, Val>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, _name: String, _key1: u64, _key2: u64) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
