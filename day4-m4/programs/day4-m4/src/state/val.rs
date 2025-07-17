use anchor_lang::prelude::*;

#[account]
pub struct Val {
    pub value: u64,
}
