import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";

const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

module.exports = async ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    if(developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [
                BASE_FEE,
                GAS_PRICE_LINK,
            ],
            waitConfirmations: 1,
            log: true
        })
        log("Mocks Deployed!\n------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]