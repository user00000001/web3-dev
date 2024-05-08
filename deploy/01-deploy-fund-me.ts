import { HardhatRuntimeEnvironment } from "hardhat/types";
import {networkConfig, developmentChains} from "../helper-hardhat-config";
import { verify } from "../utils/verify";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network} = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;

    let ethUsdPriceFeedAddr = (networkConfig as { [key: number]: {
        name: string,
        ethUsdPriceFeed?: string,
    }})[chainId]['ethUsdPriceFeed']!;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddr = ethUsdAggregator.address;
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddr],
        log: true,
        waitConfirmations: 1,
    })

    if(
        !developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY
    ) {
        // await verify("0xaC7Dba8Ca61C8C87309356bec099D0F587701219", [ethUsdPriceFeedAddr]);
        await verify(fundMe.address, [ethUsdPriceFeedAddr]);
    }

    log("---------------------------------")
}

module.exports.tags = ["all", "fundme"]