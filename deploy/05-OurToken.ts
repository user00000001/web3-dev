import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { INITIAL_SUPPLY, developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config";
import { verify } from "../helper-functions";
import {
    OurToken
} from "../typechain-types";
import { network } from "hardhat";
import { BigNumber } from "ethers";

const deployFunction: DeployFunction = async ({
    deployments, getNamedAccounts, ethers
}: HardhatRuntimeEnvironment)=>{
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const args = [INITIAL_SUPPLY];
    // const ourTokenDeploy = (await deploy("OurToken1", {
    //     contract: "OurToken",
    //     from: deployer,
    //     args,
    //     log: true,
    //     waitConfirmations: 1,
    // }));
    const ourToken: OurToken = await ethers.getContract("OurToken1");
    ourToken.connect(deployer);
    ourToken.attach("0x5D5e975Bc2219335C52e1640124AB3e3Ff6BeE6E");
    const totalSupply: BigNumber = await ourToken.totalSupply();
    const decimals = await ourToken.decimals();
    log(`ourToken deployed at ${ourToken.address} ${deployer} owns ${totalSupply.div(BigNumber.from(10).pow(decimals)).toString()} OTs`)
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(ourToken.address, args, "contracts/OurToken.sol:OurToken")
    }
}

export default deployFunction;
deployFunction.tags = ["erc20"]