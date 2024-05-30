import { ethers, upgrades } from "hardhat";

async function main() {
  const gnosisSafe = process.env.NEXT_PROXY_ADMIN || "FILL_ME_IN";

  console.log(`Transferring ownership of ProxyAdmin...`);
  // The owner of the ProxyAdmin can upgrade our contracts
  await upgrades.admin.transferProxyAdminOwnership(gnosisSafe);
  console.log("Transferred ownership of ProxyAdmin to:", gnosisSafe);
}

main()
  .then(async () => {
    const signer = await ethers.getSigner(process.env.NEXT_PROXY_ADMIN!);
    const Box_F = await ethers.getContractFactory(
      "Box",
      process.env.NEXT_PROXY_ADMIN || signer
    );
    console.log("Preparing upgrade...");
    const boxAddress = await upgrades.prepareUpgrade(
      process.env.PROXY_OF_BOX!,
      Box_F
    );
    console.log("Box at:", boxAddress);
    let box1 = await upgrades.upgradeProxy(
      process.env.PROXY_OF_BOX || "FILL ME IN",
      Box_F
    );
    console.log("Your upgraded proxy is done!", box1.address);
    const box = Box_F.attach(process.env.PROXY_OF_BOX!);
    console.log(`Box's Version: ${await box.version()}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
