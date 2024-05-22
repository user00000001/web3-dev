import { task } from "hardhat/config";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

const jsonRpcProvider = process.env.SEPOLIA_URL;
const provider = ethers.getDefaultProvider(jsonRpcProvider);

task("block-number", "Prints the current block number").setAction(
    async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        await provider.getBlockNumber().then((blockNumber: number) => {
            console.log(`Current block number: ${blockNumber}`)
        })
    }
)