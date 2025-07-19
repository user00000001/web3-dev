use anchor_lang::prelude::*;

#[account]
pub struct MyPda {
    pub x: u64,
}
