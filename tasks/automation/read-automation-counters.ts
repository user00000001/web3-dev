import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { AutomationCounter, AutomationCounter__factory } from "../../typechain-types"
import { BigNumber } from "ethers"

task(
    "read-automation-counter",
    "Gets the value of the counter from the Counter contract used to demo Chainlink Automation"
)
    .addParam("contract", "The address of the Price Feed consumer contract that you want to read")
    .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
        const contractAddr = taskArgs.contract
        const networkId = hre.network.name

        console.log(
            "Reading counter from Automation contract ",
            contractAddr,
            " on network ",
            networkId
        )

        //Get signer information
        const accounts: SignerWithAddress[] = await hre.ethers.getSigners()
        const signer: SignerWithAddress = accounts[0]

        const automationCounterContract: AutomationCounter = AutomationCounter__factory.connect(
            contractAddr,
            signer
        )
        const counter: BigNumber = await automationCounterContract.counter()

        console.log(`Counter is: ${counter.toString()}`)
        const checkData = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("1111111111111111111111"))
        const interval: BigNumber = await automationCounterContract.interval()
        await hre.network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
        await hre.network.provider.send("evm_mine")
        await automationCounterContract.performUpkeep(checkData)
        console.log(`performUpkeep once, counter increased one.`)
    })
