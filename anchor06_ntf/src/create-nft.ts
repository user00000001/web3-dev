import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
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

// mint nft 
const mint = generateSigner(umi);

// create nft tx on devnet
const transaction = await createNft(umi, {
  mint,
  name: "My NFT",
  uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    verified: false,
    key: collectionAddress,
  },
});
await transaction.sendAndConfirm(umi);

// await for some interval, fetch mint account will not found.
await new Promise((resolve)=>setTimeout(resolve, 15000))

// get onchain nft infos.
const createdCollectionNft = await fetchDigitalAsset(
  umi,
  mint.publicKey
);

console.log(
  `Created NFT, Address is ${getExplorerLink(
    "address",
    createdCollectionNft.mint.publicKey,
    "devnet"
  )}`
);
