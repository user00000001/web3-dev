import { ethers, network } from "hardhat";
import { FundMe, FundMe__factory } from "../typechain-types";

async function main() {
  const FundMe = (await ethers.getContractFactory("FundMe")) as FundMe__factory;
  const fundme: FundMe = await FundMe.deploy("0x694AA1769357215DE4FAC081bf1f309aDC325306");

  await fundme.deployed();

  console.log(
    `deployed to ${fundme.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
