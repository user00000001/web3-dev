import { ethers, network } from "hardhat";
import {
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  MIN_DELAY,
  developmentChains,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import { moveTime } from "../utils/move-time";
import { GBox, GovernorContract } from "../typechain";

export async function queueAndExecute() {
  const args = [NEW_STORE_VALUE];
  const functionToCall = FUNC;
  const gbox: GBox = await ethers.getContract("GBox");
  const encodedFunctionCall = gbox.interface.encodeFunctionData(
    // @ts-ignore not sure, typechain bug?
    functionToCall,
    args
  );
  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)
  );
  // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

  const governor: GovernorContract = await ethers.getContract(
    "GovernorContract"
  );
  console.log("Queueing...");
  const queueTx = await governor.queue(
    [gbox.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await queueTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }

  console.log("Executing...");
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor.execute(
    [gbox.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await executeTx.wait(1);
  const boxNewValue = await gbox.retrieve();
  console.log(boxNewValue.toString());
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
