use anchor_lang::prelude::*;
use anchor_spl::{associated_token, metadata, token_interface};

use crate::{NAME, SYMBOL, URI};

#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_mint,
        mint::freeze_authority = collection_mint,
        mint::token_program = token_program,
        seeds = ["collection_mint".as_bytes()],
        bump
    )]
    pub collection_mint: InterfaceAccount<'info, token_interface::Mint>,
    /// CHECK: This account will be initialized by the metaplex program.
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: This account will be initialized by the metaplex program.
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        token::mint = collection_mint,
        token::authority = collection_token_account,
        seeds = ["collection_token_account".as_bytes()],
        bump
    )]
    pub collection_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub token_meta_program: Program<'info, metadata::Metadata>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_lottery_(ctx: Context<InitializeLottery>) -> Result<()> {
    let signers_seeds: &[&[&[u8]]] =
        &[&["collection_mint".as_bytes(), &[ctx.bumps.collection_mint]]];
    token_interface::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_interface::MintTo {
                mint: ctx.accounts.collection_mint.to_account_info(),
                to: ctx.accounts.collection_token_account.to_account_info(),
                authority: ctx.accounts.collection_mint.to_account_info(),
            },
        )
        .with_signer(signers_seeds),
        1,
    )?;
    msg!("mint to token account.");
    metadata::create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_meta_program.to_account_info(),
            metadata::CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signers_seeds,
        ),
        metadata::mpl_token_metadata::types::DataV2 {
            name: NAME.to_string(),
            uri: URI.to_string(),
            symbol: SYMBOL.to_string(),
            seller_fee_basis_points: 0,
            creators: Some(vec![metadata::mpl_token_metadata::types::Creator {
                address: ctx.accounts.collection_mint.key(),
                verified: false,
                share: 100,
            }]),
            collection: None,
            uses: None,
        },
        true,
        true,
        Some(metadata::mpl_token_metadata::types::CollectionDetails::V1 { size: 0 }),
    )?;
    msg!("create metadata accounts");
    metadata::create_master_edition_v3(
        CpiContext::new(
            ctx.accounts.token_meta_program.to_account_info(),
            metadata::CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        )
        .with_signer(signers_seeds),
        Some(0),
    )?;
    msg!("create master edition account.");
    metadata::sign_metadata(CpiContext::new_with_signer(
        ctx.accounts.token_meta_program.to_account_info(),
        metadata::SignMetadata {
            creator: ctx.accounts.collection_mint.to_account_info(),
            metadata: ctx.accounts.metadata.to_account_info(),
        },
        signers_seeds,
    ))?;
    msg!("verify collection mint.");
    Ok(())
}
