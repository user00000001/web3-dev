#![allow(unexpected_cfgs, private_interfaces)]
use anchor_lang::prelude::*;

#[account]
struct Storage {
    pub a: u32,
    pub b: u8,
    pub c: u8,
    pub e: u16,
}

#[derive(Accounts)]
pub struct ReadOtherDataTypeNotMatched<'info> {
    /// CHECK: unchechked Accounts
    pub storage: AccountInfo<'info>,
}

pub fn read_other_data_type_not_matched_(ctx: Context<ReadOtherDataTypeNotMatched>) -> Result<()> {
    let mut storage_data: &[u8] = &ctx.accounts.storage.try_borrow_data()?;
    let storage: Storage = Storage::try_deserialize(&mut storage_data)?;
    msg!(
        "account-{}: a field is {}, b field is {}, c field is {}, e field is {}.",
        ctx.accounts.storage.key(),
        storage.a,
        storage.b,
        storage.c,
        storage.e
    );
    Ok(())
}
