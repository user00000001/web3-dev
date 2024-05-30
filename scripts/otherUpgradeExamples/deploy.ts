import { ethers, upgrades } from "hardhat";

async function main() {
  const Box = await ethers.getContractFactory("Box");
  console.log("Deploying Box, ProxyAdmin, and then Proxy...");
  const proxy = await upgrades.deployProxy(Box, [42], { initializer: "store" });
  console.log("Proxy of Box deployed to:", proxy.address);
  return proxy.address;
}

main()
  .then(async (proxyaddress: string) => {
    const box_f = await ethers.getContractFactory("Box");
    const box = box_f.attach(proxyaddress);
    console.log(`Box's Version: ${await box.version()}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
