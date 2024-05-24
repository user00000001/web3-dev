import { ethers, getNamedAccounts, network } from "hardhat";
import { IWeth } from "../typechain-types";
import { networkConfig } from "../helper-hardhat-config";

const AMOUNT = ethers.utils.parseEther("0.02");

async function getWeth(): Promise<IWeth> {
    const { deployer } = await getNamedAccounts();
    const iWeth: IWeth = await ethers.getContractAt(
        "IWeth",
        // "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // mainnet token, using hardhat forking to simulator transaction
        networkConfig[network.config.chainId!]["wethToken"]!,
        deployer,
    )
    const txResp = await iWeth.deposit({value: AMOUNT});
    await txResp.wait(1);
    const wethBalance = await iWeth.balanceOf(deployer);
    console.log(`Got ${ethers.utils.formatEther(wethBalance)} WETH`);
    return iWeth;
}

export {
    getWeth,
    AMOUNT,
}