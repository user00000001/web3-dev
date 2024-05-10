import { run } from "hardhat";

// for etherscan connection.

// import { ProxyAgent, setGlobalDispatcher } from "undici";
// const proxyAgent = new ProxyAgent("http://127.0.0.1:10809")
// setGlobalDispatcher(proxyAgent)

async function verify(contractAddr: string, args: string[]) {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddr,
            constructorArguments: args,
        })
    } catch(e: any) {
        if(e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.error(e)
        }
    }
}

export {
    verify,
}