#![allow(unexpected_cfgs, private_interfaces)]
use anchor_lang::prelude::*;

#[account]
struct Storage {
    pub y: u64,
}

#[derive(Accounts)]
pub struct ReadOtherDataFieldNameNotMatched<'info> {
    /// CHECK: unchechked Accounts
    pub storage: AccountInfo<'info>,
}

pub fn read_other_data_fieldname_not_matched_(
    ctx: Context<ReadOtherDataFieldNameNotMatched>,
) -> Result<()> {
    let mut storage_data: &[u8] = &ctx.accounts.storage.try_borrow_data()?;
    let storage: Storage = Storage::try_deserialize(&mut storage_data)?;
    msg!(
        "account-{}: y field is {}",
        ctx.accounts.storage.key(),
        storage.y
    );
    Ok(())
}
