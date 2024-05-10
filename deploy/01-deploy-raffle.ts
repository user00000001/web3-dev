import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { VRFCoordinatorV2Mock } from "../typechain-types";
import { verify } from "../utils/verify";

import type { BigNumber } from "ethers"; 

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");

module.exports = async ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    let vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval;
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const txResp = await vrfCoordinatorV2Mock.createSubscription();
        const txRcpt = await txResp.wait(1);
        subscriptionId = txRcpt.events![0]!.args!.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = (networkConfig as {
            [key: number]: {
                vrfCoordinatorV2?: string,
            }})[network.config.chainId!]["vrfCoordinatorV2"]!;
    }
    entranceFee = (networkConfig as {
        [key: number]: {
            entranceFee: BigNumber,
        }})[network.config.chainId!]["entranceFee"]!;
    gasLane = (networkConfig as {
        [key: number]: {
            gasLane: string,
        }})[network.config.chainId!]["gasLane"]!;
    callbackGasLimit = (networkConfig as {
        [key: number]: {
            callbackGasLimit: string,
        }})[network.config.chainId!]["callbackGasLimit"]!;
    interval = (networkConfig as {
        [key: number]: {
            interval: string,
        }})[network.config.chainId!]["interval"]!;
    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        waitConfirmations: 1,
        log: true,
    });
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(raffle.address, args)
    }
    log("------------------------")
}

module.exports.tags = ["all", "rafffle"]