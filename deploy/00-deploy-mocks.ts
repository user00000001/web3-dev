import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DECIMALS, INITIAL_ANSWER, developmentChains } from "../helper-hardhat-config";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network} = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            args: [DECIMALS, INITIAL_ANSWER],
            from: deployer,
            log: true,
        });
        log("Mocks deployed!\n--------------------------------")
    }
    
}

module.exports.tags = ["all", "mocks"]