import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { verify } from "../helper-functions";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import { GBox, TimeLock } from "../typechain";

const deployGBox: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("----------------------------------------------------");
  log("Deploying GBox and waiting for confirmations...");
  const gbox = await deploy("GBox", {
    contract: "contracts/GovernanceToken.sol:GBox",
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations:
      networkConfig[network.config.chainId!].blockConfirmations || 1,
  });
  log(`GBox at ${gbox.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(gbox.address, []);
  }
  const gboxContract: GBox = await ethers.getContractAt(
    "contracts/GovernanceToken.sol:GBox",
    gbox.address
  );
  const timeLock: TimeLock = await ethers.getContract("TimeLock");
  const transferTx = await gboxContract.transferOwnership(timeLock.address);
  await transferTx.wait(1);
};

export default deployGBox;
deployGBox.tags = ["all", "gbox"];
