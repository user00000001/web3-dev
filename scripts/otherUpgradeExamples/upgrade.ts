import { ethers, upgrades } from "hardhat";

async function main() {
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  let box = await upgrades.upgradeProxy(
    process.env.PROXY_OF_BOX || "FILL ME IN",
    BoxV2
  );
  console.log("Your upgraded proxy is done!", box.address);
}

main()
  .then(async () => {
    const box_f = await ethers.getContractFactory("Box");
    const box = box_f.attach(process.env.PROXY_OF_BOX!);
    console.log(`Box's Version: ${await box.version()}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
