#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

use crate::SomeAccount;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub some_account: Account<'info, SomeAccount>, // Account will check the owner of this address.
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}

#[derive(Accounts)]
pub struct Foo<'info> {
    /// CHECK: unchecked Account
    pub some_account: AccountInfo<'info>,
}

pub fn foo_(ctx: Context<Foo>) -> Result<()> {
    let data = ctx.accounts.some_account.try_borrow_data()?;
    msg!("{:#?}", data);
    Ok(())
}

#[derive(Accounts)]
pub struct Hello<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}

pub fn hello_(ctx: Context<Hello>) -> Result<()> {
    let lamports = ctx.accounts.signer.lamports();
    let address = ctx.accounts.signer.signer_key().unwrap();
    msg!("address: {}, has {} lamports", address, lamports);
    Ok(())
}
