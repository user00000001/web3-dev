// we can't have these functions in our `helper-hardhat-config`
// since these use the hardhat library
// and it would be a circular dependency
import { run } from "hardhat";

const verify = async (contractAddress: string, args: any[], contract: string = "") => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", contract ? {
      address: contractAddress,
      constructorArguments: args,
      contract,
    } : {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.error(e);
    }
  }
};

export {
  verify,
};
