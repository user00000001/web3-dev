import { ethers, network, run } from "hardhat";
import { BigNumber, constants } from "ethers";
import { MockLinkToken, MockLinkToken__factory} from "./typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { networkConfig } from "./helper-hardhat-config";

export const autoFundCheck = async (
    contractAddr: string,
    networkName: string,
    mockLinkTokenAddress: string,
    additionalMessage: string,
) => {
    const chainId: number|undefined = network.config.chainId;
    console.log("Checking to see if contract can be auto-funded with LINK:")
    if (!chainId) return
    const amount: BigNumber = networkConfig[chainId].fundAmount;
    const accounts: SignerWithAddress[] = await ethers.getSigners();
    const signer: SignerWithAddress = accounts[0];
    const mockLinkTokenContract: MockLinkToken = MockLinkToken__factory.connect(mockLinkTokenAddress, signer);
    const balance: BigNumber = await mockLinkTokenContract.balanceOf(signer.address);
    const contractBalance: BigNumber = await mockLinkTokenContract.balanceOf(contractAddr)

    if(balance > amount && amount > constants.Zero && contractBalance < amount) {
        return true;
    } else {
        console.warn(
            `Account doesn't have enough LINK to fund contracts, or you're deploying to a network where auto funding isnt' done by default\n`,
            `Please obtain LINK via the faucet at https://faucets.chain.link/, then run the following command to fund contract with LINK:\n`,
            `pnpm hardhat fund-link --contract ${contractAddr} --network ${networkName} ${additionalMessage}`
        )
        return false;
    }


}

export const verify = async (contractAddress: string, args: any[]) => {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e: any) {
        if(e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.error(e)
        }
    }
}