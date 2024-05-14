import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";

const BASE_FEE = ethers.utils.parseEther("0.25");
const WEI_PER_UNIT_LINK = ethers.utils.parseEther("0.004");
const GAS_PRICE_LINK = 1e9;

module.exports = async ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    if(developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks v2.5...");
        await deploy("VRFCoordinatorV2_5Mock", {
            from: deployer,
            gasLimit: 300000000,
            args: [
                BASE_FEE,
                GAS_PRICE_LINK,
                WEI_PER_UNIT_LINK,
            ],
            waitConfirmations: 1,
            log: true
        })
        log("Mocks v2.5 Deployed!\n------------------------------------------------")
    }
}

module.exports.tags = ["all-2.5", "mocks-2.5"]