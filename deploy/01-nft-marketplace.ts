import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";
import { verify } from "../utils/verify";


const deployFunciton: DeployFunction = async ({
  getNamedAccounts,
  deployments: { deploy, log },
  network
}: HardhatRuntimeEnvironment) => {
  // const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args: any[] = [];
  const nftmarketplace = await deploy("NftMarketplace", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: 1,
  });
  log("----------------------------");
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(
      nftmarketplace.address,
      args,
    )
  }
};

export default deployFunciton;
deployFunciton.tags = ["all", "nftmarketplace"];
