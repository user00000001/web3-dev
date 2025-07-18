use anchor_lang::{prelude::*, solana_program::rent};

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
        bump,
    )]
    pub my_storage: Account<'info, MyStorage>,
    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<Initialize>) -> Result<()> {
    let cost_of_empty_acc = rent::ACCOUNT_STORAGE_OVERHEAD as f64
        * rent::DEFAULT_LAMPORTS_PER_BYTE_YEAR as f64
        * rent::DEFAULT_EXEMPTION_THRESHOLD;
    msg!("cost to create an empty account: {:?}", cost_of_empty_acc);
    let cost_of_32_bytes = cost_of_empty_acc
        + 32 as f64
            * rent::DEFAULT_LAMPORTS_PER_BYTE_YEAR as f64
            * rent::DEFAULT_EXEMPTION_THRESHOLD;
    msg!("cost to create an empty account: {:?}", cost_of_32_bytes);
    Ok(())
}

#[derive(Accounts)]
#[instruction(incre_size: u64)]
pub struct IncreStructSize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        realloc = size_of::<MyStorage>() + 8 + incre_size as usize, // MAX_SIZE: 10240 (10mB)
        realloc::payer = signer,
        realloc::zero = false,
        seeds = [],
        bump,
    )]
    pub my_storage: Account<'info, MyStorage>,
    pub system_program: Program<'info, System>,
}

pub fn incre_struct_size_(_ctx: Context<IncreStructSize>, _incred_size: u64) -> Result<()> {
    Ok(())
}
