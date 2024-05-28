import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BasicNft, DynamicSvgNft, RandomIpfsNft } from "../typechain";

const mint: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, network, ethers } = hre;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Basic NFT
  const basicNft: BasicNft = await ethers.getContract("BasicNft", deployer);
  const basicMintTx = await basicNft.mintNft();
  await basicMintTx.wait(1);
  console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`);

  // Dynamic SVG  NFT
  const highValue = ethers.utils.parseEther("4000");
  const dynamicSvgNft: DynamicSvgNft = await ethers.getContract(
    "DynamicSvgNft",
    deployer
  );
  const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue);
  await dynamicSvgNftMintTx.wait(1);
  console.log(
    `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
  );

  // Random IPFS NFT
  const randomIpfsNft: RandomIpfsNft = await ethers.getContract(
    "RandomIpfsNft",
    deployer
  );
  const mintFee = await randomIpfsNft.s_mintFee();
  const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
    value: mintFee.toString(),
  });
  const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);
  // Need to listen for response
  const eventHandler = new Promise<void>((resolve) => {
    setTimeout(resolve, 300000); // 5 minute timeout time
    // setup listener for our event
    randomIpfsNft.once("NftMinted", async () => {
      resolve();
    });
  });
  if (chainId === 31337) {
    const requestId =
      randomIpfsNftMintTxReceipt.events![1]!.args!.requestId.toString();
    const vrfCoordinatorV2_5Mock = await ethers.getContract(
      "VRFCoordinatorV2_5Mock",
      deployer
    );
    await vrfCoordinatorV2_5Mock.fulfillRandomWords(
      requestId,
      randomIpfsNft.address
    );
  }
  await Promise.resolve(eventHandler);
  console.log(
    `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`
  );
};
export default mint;
mint.tags = ["all", "mint"];
