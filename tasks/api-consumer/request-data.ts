import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { APIConsumer, APIConsumer__factory, MockOracle } from "../../typechain-types"
import { ContractReceipt, ContractTransaction } from "ethers"
import { ethers } from "hardhat"

task("request-data", "Calls an API Consumer Contract to request external data")
    .addParam("contract", "The address of the API Consumer contract that you want to call")
    .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
        const contractAddr: string = taskArgs.contract

        console.log(`Calling API Consumer contract ${contractAddr} on network ${hre.network.name}`)

        //Get signer information
        const accounts: SignerWithAddress[] = await hre.ethers.getSigners()
        const signer: SignerWithAddress = accounts[0]

        //Create connection to API Consumer Contract and call the createRequestTo function
        const apiConsumerContract: APIConsumer = APIConsumer__factory.connect(contractAddr, signer)

        const tx: ContractTransaction = await apiConsumerContract.requestVolumeData()
        const txRcpt: ContractReceipt = await tx.wait(1)

        const mockOracle: MockOracle = await hre.ethers.getContract("MockOracle", signer)
        await mockOracle.fulfillOracleRequest(txRcpt.events![0].args!.id, "0x29415dbcba001def21c808807363e2d299c780569d1932be58b379bc2b9c569c");

        console.log(
            `Contract ${contractAddr} external data request successfully called. Transaction Hash: ${tx.hash}\n`,
            `Run the following to read the returned result:\n`,
            `pnpm hardhat read-data --contract ${contractAddr} --network ${hre.network.name}`
        )
    })
