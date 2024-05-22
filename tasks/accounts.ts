import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

task("accounts1", "Prints the list of accounts", async(taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment)=>{
    const accounts: SignerWithAddress[] = await hre.ethers.getSigners();
    for (let index=0; index < accounts.length; index++) {
        console.log(`Account-${index}: ${accounts[index].address}`);
    }
})

task("accounts2", "Prints the list of accounts").setAction(
    async(taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment)=>{
        const accounts: SignerWithAddress[] = await hre.ethers.getSigners();
        accounts.forEach((account, index)=>{
            console.log(`Account-${index}: ${accounts[index].address}`);
        })
    }
)