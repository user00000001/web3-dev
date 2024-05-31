import { assert } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import {
  Box,
  BoxProxyAdmin,
  TransparentUpgradeableProxy,
} from "../../typechain";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Upgrading tests", function () {
      let box: Box,
        box_impl: Box,
        transparentProxy: TransparentUpgradeableProxy,
        proxyBox: Box,
        boxProxyAdmin: BoxProxyAdmin;
      beforeEach(async () => {
        await deployments.fixture(["boxes"]);
        box = await ethers.getContract("Box"); // this Box is Proxy of Box with correct storage, and using Box's abi
        box_impl = await ethers.getContract("Box_Implementation"); // this is Box contract's instance with individual storage
        transparentProxy = await ethers.getContract("Box_Proxy"); // Proxy of Box with correct storage, but without Box's abi
        proxyBox = await ethers.getContractAt("Box", transparentProxy.address); // Proxy of Box with Box's abi and correct storage
        boxProxyAdmin = await ethers.getContract("BoxProxyAdmin"); // can change proxy of box 's box's address
      });
      it("can deploy and upgrade a contract", async function () {
        const startingVersion = await proxyBox.version();
        assert.equal(startingVersion.toString(), "1");
        // await deployments.fixture(["boxv2"]);
        const boxV2 = await ethers.getContract("BoxV2"); // this is BoxV2 contract's instance with individual storage
        const upgradeTx = await boxProxyAdmin.upgrade(
          transparentProxy.address,
          boxV2.address
        );
        await upgradeTx.wait(1);
        const endingVersion = await proxyBox.version();
        assert.equal(endingVersion.toString(), "2");
        assert.equal((await box_impl.version()).toString(), "1");
        assert.equal((await boxV2.version()).toString(), "2");
      });
    });
