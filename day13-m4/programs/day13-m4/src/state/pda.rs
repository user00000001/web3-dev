use anchor_lang::prelude::*;

#[account]
pub struct Pda {
    pub value: u32,
}
