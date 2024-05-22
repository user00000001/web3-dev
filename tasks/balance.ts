import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import {ethers, BigNumber, utils} from "ethers";

const jsonRpcProvider = process.env.SEPOLIA_URL;
const provider = ethers.getDefaultProvider(jsonRpcProvider);

task("balance").setDescription("Prints an account's balance")
    .addParam("account", "The account's address")
    .setAction(async(taskArgs: TaskArguments)=>{
        const account: string = utils.getAddress(taskArgs.account);
        const balance: BigNumber = await provider.getBalance(account);
        console.log(`${utils.formatEther(balance)} ETH`);
    })