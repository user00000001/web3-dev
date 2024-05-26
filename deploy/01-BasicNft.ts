import {
  VERIFICATION_BLOCK_CONFIRMATIONS,
  developmentChains,
} from "../helper-hardhat-config";
import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { verify } from "../utils/verify";

const deployFunction: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const deployer = (await getNamedAccounts()).deployer;
  const waitConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;
  log("---------------------------------");
  const args: any[] = [];
  const basicNft = await deploy("BasicNft", {
    from: deployer,
    log: true,
    args,
    waitConfirmations: waitConfirmations || 1,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(basicNft.address, args);
  }
};

export default deployFunction;
deployFunction.tags = ["basicnft"];
