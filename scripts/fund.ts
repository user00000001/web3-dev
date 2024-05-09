import { ethers, network } from "hardhat";
import { FundMe } from "../typechain-types";

async function main() {
  const fundme: FundMe = await ethers.getContract("FundMe")
  const txResp = await fundme.fund({value: ethers.utils.parseEther("100")})
  const txRcpt = await txResp.wait(1);

  console.log(
    `fund to ${fundme.address} \n ${JSON.stringify(txRcpt)}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
