import {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config";

import { verify } from "../helper-functions";
import { HardhatRuntimeEnvironment } from "hardhat/types";

module.exports = async ({
  getNamedAccounts,
  deployments,
  ethers,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");

  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: waitBlockConfirmations,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: {
        name: "BoxProxyAdmin",
        artifact: "BoxProxyAdmin",
      },
    },
  });

  log("----------------------------------------------------");

  const box2 = await deploy("BoxV2", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // Be sure to check out the hardhat-deploy examples to use UUPS proxies!
  // https://github.com/wighawag/template-ethereum-contracts

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    const boxAddress = (await ethers.getContract("Box_Implementation")).address;
    const boxProxyAdmin = (await ethers.getContract("BoxProxyAdmin")).address;
    const boxProxy = (await ethers.getContract("Box_Proxy")).address; // this is the same address of deploy("Box")
    await verify(boxAddress, []);
    await verify(boxProxy, []);
    await verify(boxProxyAdmin, [deployer], "contracts/Box.sol:BoxProxyAdmin");
    await verify(box2.address, [], "contracts/Box.sol:BoxV2");
  }
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "box"];
