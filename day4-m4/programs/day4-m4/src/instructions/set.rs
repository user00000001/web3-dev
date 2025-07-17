use anchor_lang::prelude::*;

use crate::Val;

#[derive(Accounts)]
#[instruction(name: String, key1: u64, key2: u64)]
pub struct Set<'info> {
    #[account(
        mut,
        seeds = [name.as_bytes(), key1.to_le_bytes().as_ref(), key2.to_le_bytes().as_ref()],
        bump
    )]
    pub val: Account<'info, Val>,
}

pub fn set_(ctx: Context<Set>, _name: String, _key1: u64, _key2: u64, value: u64) -> Result<()> {
    ctx.accounts.val.value = value;
    Ok(())
}
