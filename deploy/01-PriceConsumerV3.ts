import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import { VERIFICATION_BLOCK_CONFIRMATIONS, developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../helper-functions";

const deployFunction: DeployFunction = async function ({getNamedAccounts, deployments}: HardhatRuntimeEnvironment) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number | undefined = network.config.chainId;
    if(!chainId) return;
    let ethUsdPriceFeedAddress: string | undefined;
    if(chainId === 31337) {
        const EthUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = EthUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const waitBlockConfirmations: number = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS;
    log(`----------------------------------------`)
    const priceConsumerV3 = await deploy("PriceConsumerV3", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(priceConsumerV3.address, [ethUsdPriceFeedAddress])
    }

    log(`Run Price Feed contract with command:`)
    const networkName = network.name === "hardhat" ? "localhost": network.name;
    log(`pnpm hardhat read-price-feed --contract ${priceConsumerV3.address} --network ${networkName}`)
    log(`----------------------------------------`)
}
export default deployFunction;
export const tags = ["all", "feed", "main"];