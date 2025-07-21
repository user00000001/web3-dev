#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

declare_id!("4pBhe4cdHAHmzYkfn3883WWLKTx26jjmU3ZDCcEJMo2j");

use day18_m4::cpi::accounts::BobAddOp;
use day18_m4::program::Day18M4;
use day18_m4::BobData;

#[program]
pub mod alice {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, a: u64, b: u64) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        //let res = day18_m4::cpi::add_and_store(
        //    CpiContext::new(
        //        ctx.accounts.bob_program.to_account_info(),
        //        BobAddOp {
        //            bob_data_account: ctx.accounts.bob_data_account.to_account_info(),
        //        },
        //    ),
        //    a,
        //    b,
        //);
        let res = day18_m4::cpi::add_and_store(ctx.accounts.add_function_ctx(), a, b);
        if !res.is_ok() {
            return err!(ErrorCode::CPIToBobFailed);
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub bob_data_account: Account<'info, BobData>,
    pub bob_program: Program<'info, Day18M4>,
}

impl<'info> Initialize<'info> {
    pub fn add_function_ctx(&self) -> CpiContext<'_, '_, '_, 'info, BobAddOp<'info>> {
        let cpi_program = self.bob_program.to_account_info();
        let cpi_accounts = BobAddOp {
            bob_data_account: self.bob_data_account.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("cpi to bob failed")]
    CPIToBobFailed,
}
