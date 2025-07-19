#![allow(unexpected_cfgs)]
use anchor_lang::{prelude::*, system_program};

use crate::{error::ErrorCode, MyStorage};

#[derive(Accounts)]
pub struct ChangeOwner<'info> {
    #[account(mut)]
    pub my_storage: Account<'info, MyStorage>,
}

pub fn change_owner_(ctx: Context<ChangeOwner>) -> Result<()> {
    let account_info = &mut ctx.accounts.my_storage.to_account_info();
    // transfer ownership
    account_info.assign(&system_program::ID);

    //let res = account_info.realloc(0, false);
    let res = account_info.resize(0);
    if !res.is_ok() {
        return err!(ErrorCode::ReallocFailed);
    }
    Ok(())
}
