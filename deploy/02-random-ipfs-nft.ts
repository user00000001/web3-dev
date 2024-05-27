import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  VERIFICATION_BLOCK_CONFIRMATIONS,
  developmentChains,
  networkConfig,
} from "../helper-hardhat-config";
import { VRFCoordinatorV25Mock } from "../typechain";
import { storeImages, storeTokenUriMetadata } from "../utils/uploadToPinata";
import { verify } from "../utils/verify";

const FUND_AMOUNT = "1000000000000000000000";
const imagesLocation = "./images/randomNft/";
let tokenUris = [
  "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
  "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
  "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
];

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

const deployFunction: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  network,
  ethers,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId!;

  if (process.env.UPLOAD_TO_PINATA === "true") {
    tokenUris = await handleTokenUris();
  }

  let vrfCoordinator: VRFCoordinatorV25Mock,
    vrfCoordinatorAddress: string,
    subscriptionId: string;
  if (developmentChains.includes(network.name)) {
    vrfCoordinator = await ethers.getContract("VRFCoordinatorV2_5Mock");
    vrfCoordinatorAddress = vrfCoordinator.address;
    const txResp = await vrfCoordinator.createSubscription();
    const txRcpt = await txResp.wait();
    subscriptionId = txRcpt.events![0]!.args!.subId;
    await vrfCoordinator.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorAddress = networkConfig[chainId].vrfCoordinatorV2_5!;
    subscriptionId = networkConfig[chainId].subscriptionId!;
  }

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");
  const args = [
    vrfCoordinatorAddress,
    subscriptionId,
    networkConfig[chainId].gasLane!,
    networkConfig[chainId].mintFee!,
    networkConfig[chainId].callbackGasLimit!,
    networkConfig[chainId].nativePayment!,
    tokenUris,
  ];
  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(randomIpfsNft.address, args);
  }
  if (developmentChains.includes(network.name)) {
    console.log(
      `vrfCoordinator.addConsumer: sepolia will do it at chainlink sepolia test website.`
    );
    // @ts-ignore, sepolia will do it at chainlink website.
    await vrfCoordinator.addConsumer(subscriptionId, randomIpfsNft.address);
  }
};

async function handleTokenUris() {
  tokenUris = [];
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  for (const imageUploadResponseIndex in imageUploadResponses) {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUriMetadata,
      {
        pinataMetadata: {
          name: `metadata-${files[imageUploadResponseIndex]}`,
        },
      }
    );
    tokenUris.push(`ipfs://${metadataUploadResponse!.IpfsHash}`);
  }
  return tokenUris;
}

export default deployFunction;
deployFunction.tags = ["all", "randomipfs", "main"];
