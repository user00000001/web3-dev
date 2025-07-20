use anchor_lang::prelude::*;

#[account]
pub struct MyPDA {
    pub counter: u64,
}
