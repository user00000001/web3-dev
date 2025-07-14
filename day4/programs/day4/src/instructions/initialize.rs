use anchor_lang::prelude::*;

use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct Initialize {}

pub fn handler(ctx: Context<Initialize>, a: u64) -> Result<()> {
    // msg shows when return Ok.
    msg!("Greetings from: {:?}", ctx.program_id);
    if a < 100 {
        return err!(ErrorCode::AIsTooSmall);
    }
    require!(a == 100, ErrorCode::AIsTooBig);
    Ok(())
}
