import { ethers, getNamedAccounts } from "hardhat";
import { RaffleV2_5 } from "../typechain-types";

async function main() {
    const { deployer } = await getNamedAccounts();
    const raffle: RaffleV2_5 = await ethers.getContract("RaffleV2_5", deployer);
    raffle.attach("0x604bA251E2A3082118cd810FB0a225958a20c599");
    const rxResp = await raffle.setCoordinator("0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B");
    const txRcpt = await rxResp.wait(1);
    console.log(txRcpt);
}

main().then(()=>process.exit(0))
.catch((error)=>{
    console.error(error);
    process.exit(1);
})