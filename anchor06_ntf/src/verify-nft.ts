import { createNft, fetchDigitalAsset, findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, publicKey, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl('devnet'));

const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
)

console.log(`User Account: ${user.publicKey.toBase58()}.`)

// operate instance to interactive.
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata())
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log(`setup umi instance for this user to operate nft.`)

// created collection account from explorer token list.
const collectionAddress = publicKey("4GKjoKBqsGY9cxpxFyuGV3F1aa1qkGRR1c6FyCWKFSzx");
// created nft account from explorer token list.
const nftAddress = publicKey("2aghMJdJXynRdkENHGdupPG96tNtypRM4dgZ8diDJqZb");

// verify nft tx on devnet
const transaction = await verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, {mint: nftAddress}),
  collectionMint: collectionAddress,
  authority: umi.identity,
});
await transaction.sendAndConfirm(umi);

// await for some interval, fetch mint account will not found.
await new Promise((resolve)=>setTimeout(resolve, 15000))

console.log(
  `NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
    "address",
    nftAddress,
    "devnet"
  )}`
);
