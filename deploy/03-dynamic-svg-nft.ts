import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MockV3Aggregator } from "../typechain";
import {
  VERIFICATION_BLOCK_CONFIRMATIONS,
  developmentChains,
  networkConfig,
} from "../helper-hardhat-config";
import { readFileSync } from "fs";
import { verify } from "../utils/verify";

const deployFunction: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const chainId = network.config.chainId!;
  const { deployer } = await getNamedAccounts();
  let AggretorV3: MockV3Aggregator;
  let AggretorV3Address: string;
  if (chainId === 31337) {
    AggretorV3 = (await deployments.get(
      "MockV3Aggregator"
    )) as unknown as MockV3Aggregator;
    AggretorV3Address = AggretorV3.address;
  } else {
    AggretorV3Address = networkConfig[chainId].ethUsdPriceFeed!;
  }

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;
  const lowSVG = readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });
  const highSVG = readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf8",
  });

  log("----------------------------------------------------");
  const args = [AggretorV3Address, lowSVG, highSVG];
  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: waitBlockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verify...");
    await verify(dynamicSvgNft.address, args);
  }
};

export default deployFunction;
deployFunction.tags = ["all", "dynamicsvg", "main"];
