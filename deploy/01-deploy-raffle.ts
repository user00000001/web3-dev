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
    let vrfCoordinatorV2Address: string,
    // @ts-ignore
    vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = "", 
    entranceFee: BigNumber, 
    gasLane: string, 
    subscriptionId: string, 
    callbackGasLimit: string, 
    interval: string;
    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const txResp = await vrfCoordinatorV2Mock.createSubscription();
        const txRcpt = await txResp.wait(1);
        subscriptionId = txRcpt.events![0]!.args!.subId!.toString();
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId.toString(), VRF_SUB_FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = (networkConfig as {
            [key: number]: {
                vrfCoordinatorV2?: string,
            }})[network.config.chainId!]["vrfCoordinatorV2"]!;
        subscriptionId = "51115538415181763257872941889490908716294351060333594023821624322196006772795" // chainlink vrf v2.5, v2 is unavailable ?
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
    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
        log('Consumer is added');
    }
    log("------------------------")
}

module.exports.tags = ["all", "raffle"]