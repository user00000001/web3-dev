#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

use crate::MyPDA;

#[derive(Accounts)]
pub struct InitializeInsecure<'info> {
    /// CHECK: unchekced account
    #[account(mut)]
    pub my_pda: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn initialize_insecure_(ctx: Context<InitializeInsecure>) -> Result<()> {
    //let mut my_pda = MyPDA::try_from_slice(&ctx.accounts.my_pda.data.borrow()).unwrap();
    //my_pda.counter = 1;
    //my_pda.serialize(&mut *ctx.accounts.my_pda.data.borrow_mut())?;

    let mut my_pda_data = ctx.accounts.my_pda.try_borrow_mut_data()?;
    let mut my_pda_slice: &[u8] = &my_pda_data;
    let mut my_pda = MyPDA::try_deserialize(&mut my_pda_slice)?;
    my_pda.counter = 1;
    my_pda.try_serialize(&mut *my_pda_data)?;
    Ok(())
}
