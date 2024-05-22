import { DeployFunction } from "hardhat-deploy/types"
import { ethers, network } from "hardhat"
import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import { verify } from "../helper-functions"
import { BigNumber, ContractReceipt, ContractTransaction } from "ethers"
import { VRFCoordinatorV2_5Mock } from "../typechain-types"

const deployFunction: DeployFunction = async ({ getNamedAccounts, deployments }) => {
    const { deploy, get, log } = deployments

    const { deployer } = await getNamedAccounts()
    const chainId: number | undefined = network.config.chainId
    if (!chainId) return

    let linkTokenAddress: string | undefined
    let vrfCoordinatorAddress: string | undefined
    let subscriptionId: BigNumber
    let VRFCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock | undefined

    if (chainId === 31337) {
        const linkToken = await get("MockLinkToken")
        VRFCoordinatorV2_5Mock = (await ethers.getContract(
            "VRFCoordinatorV2_5Mock"
        )) as VRFCoordinatorV2_5Mock

        vrfCoordinatorAddress = VRFCoordinatorV2_5Mock.address
        linkTokenAddress = linkToken.address

        const fundAmount: BigNumber = networkConfig[chainId].fundAmount
        const transaction: ContractTransaction = await VRFCoordinatorV2_5Mock.createSubscription()
        const transactionReceipt: ContractReceipt = await transaction.wait(1)
        if (!transactionReceipt.events) return
        subscriptionId = ethers.BigNumber.from(transactionReceipt.events[0].topics[1])
        await VRFCoordinatorV2_5Mock.fundSubscription(subscriptionId, fundAmount)
    } else {
        subscriptionId = BigNumber.from(process.env.VRF_SUBSCRIPTION_ID)
        linkTokenAddress = networkConfig[chainId].linkToken
        vrfCoordinatorAddress = networkConfig[chainId].vrfCoordinator
    }

    const keyHash: string | undefined = networkConfig[chainId].keyHash
    const nativePayment: boolean | undefined = networkConfig[chainId].nativePayment
    const waitBlockConfirmations: number = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const args = [subscriptionId, vrfCoordinatorAddress, keyHash, nativePayment]
    const randomNumberConsumerV2Plus = await deploy("RandomNumberConsumerV2Plus", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomNumberConsumerV2Plus.address, args)
    } else {
        await VRFCoordinatorV2_5Mock?.addConsumer(subscriptionId, randomNumberConsumerV2Plus.address);
    }

    log("Run RandomNumberConsumerV2Plus contract with the following command")
    const networkName = network.name == "hardhat" ? "localhost" : network.name
    log(
        `pnpm hardhat request-random-number --contract ${randomNumberConsumerV2Plus.address} --network ${networkName}`
    )
    log("----------------------------------------------------")
}

export default deployFunction
deployFunction.tags = [`all`, `vrf`]
