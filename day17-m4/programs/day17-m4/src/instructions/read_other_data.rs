#![allow(unexpected_cfgs, private_interfaces)]
use anchor_lang::prelude::*;

#[account]
struct Storage {
    pub x: u64,
}

#[derive(Accounts)]
pub struct ReadOtherData<'info> {
    /// CHECK: unchechked Accounts
    pub storage: AccountInfo<'info>,
}

pub fn read_other_data_(ctx: Context<ReadOtherData>) -> Result<()> {
    let mut storage_data: &[u8] = &ctx.accounts.storage.try_borrow_data()?;
    let storage: Storage = Storage::try_deserialize(&mut storage_data)?;
    msg!(
        "account-{}: x field is {}",
        ctx.accounts.storage.key(),
        storage.x
    );
    Ok(())
}
