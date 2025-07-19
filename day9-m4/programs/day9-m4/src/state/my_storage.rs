use anchor_lang::prelude::*;

#[account]
pub struct MyStorage {
    pub x: u64,
}
