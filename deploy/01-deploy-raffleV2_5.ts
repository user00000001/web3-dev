import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { VRFCoordinatorV2_5Mock } from "../typechain-types";
import { verify } from "../utils/verify";

import type { BigNumber } from "ethers"; 

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");

module.exports = async ({ getNamedAccounts, deployments, network, artifacts }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    let vrfCoordinatorV2_5Address: string,
    vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock,
    entranceFee: BigNumber, 
    gasLane: string, 
    subscriptionId: string, 
    callbackGasLimit: string, 
    interval: string,
    nativePayment: string;
    // console.log('hre artifacts:', await artifacts.getArtifactPaths());
    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock");
        vrfCoordinatorV2_5Address = vrfCoordinatorV2_5Mock.address;
        const txResp = await vrfCoordinatorV2_5Mock.createSubscription();
        const txRcpt = await txResp.wait(1);
        subscriptionId = txRcpt.events![0]!.args!.subId!.toString();
        // console.log(subscriptionId);
        await vrfCoordinatorV2_5Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
    } else {
        vrfCoordinatorV2_5Address = (networkConfig as {
            [key: number]: {
                vrfCoordinatorV2_5?: string,
            }})[network.config.chainId!]["vrfCoordinatorV2_5"]!;
        subscriptionId = "34604683759749477888056652172057628403454283637887467963489055799049183689105" // chainlink vrf v2.5, v2 is unavailable ?
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
    nativePayment = (networkConfig as {
        [key: number]: {
            nativePayment: string,
        }})[network.config.chainId!]["nativePayment"]!;
    const args = [
        vrfCoordinatorV2_5Address,
        entranceFee.toString(),
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
        nativePayment
    ]
    const raffle = await deploy("RaffleV2_5", {
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
        // @ts-ignore
        await vrfCoordinatorV2_5Mock.addConsumer(subscriptionId, raffle.address);
        log('Consumer is added');
    }
    log("------------------------")
}

module.exports.tags = ["all-2.5", "raffle-2.5"]