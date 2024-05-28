import { ethers, network } from "hardhat";
import { BasicNft, BasicNftTwo } from "../typechain";
import { moveBlocks } from "../utils/move-blocks";

const PRICE = ethers.utils.parseEther("0.1");

async function main() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const randomNumber = Math.floor(Math.random() * 2);
  let basicNft: BasicNft | BasicNftTwo;
  if (randomNumber == 1) {
    basicNft = await ethers.getContract("BasicNftTwo");
  } else {
    basicNft = await ethers.getContract("BasicNft");
  }
  console.log("Minting NFT...");
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events![0].args!.tokenId;
  console.log("Approving NFT...");
  const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
  await approvalTx.wait(1);
  console.log("Listing NFT...");
  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
  await tx.wait(1);
  console.log("NFT Listed!");
  if (network.config.chainId == 31337) {
    // Moralis has a hard time if you move more than 1 at once!
    let sleepAmount;
    await moveBlocks(1, (sleepAmount = 1000));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
