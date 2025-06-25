# Create NFT by metaplex.

## init package and dependencies.

```
pnpm init
pnpm add @metaplex-foundation/{umi{,-bundle-defaults},mpl-token-metadata} @solana/web3.js @solana-developers/helpers
pnpm add -D esrun
```

## create nft collection.
```bash
proxychains pnpm esrun src/create-collection.ts
```
## create nft item.
```bash
proxychains pnpm esrun src/create-nft.ts
```
## verified nft item.
```bash
proxychains pnpm esrun src/verify-nft.ts
```
