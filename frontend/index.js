import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddr } from "./constants.js";

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const withdrawButton = document.getElementById("withdrawButton")
const balanceButton = document.getElementById("accountBalance")
const balanceShow = document.getElementById("balanceShow")
const addr = document.getElementById("accountAddr");
connectButton.onclick = connection;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;
balanceButton.onclick = balance;
addr.width = "30%";
addr.value = contractAddr;

async function connection() {
    if(window.ethereum) {
        await window.ethereum.request({method: "eth_requestAccounts"});
        connectButton.innerText = "Connected!"
    } else {
        console.log("No ethereum wallet!")
        connectButton.innerText = "Please install MetaMask"
    }
}

async function fund() {
    const fund_input = document.getElementById("fund");
    if(window.ethereum) {
        await window.ethereum.request({method: "eth_requestAccounts"});
        connectButton.innerText = "Connected!"
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        const fundMe = new ethers.Contract(contractAddr, abi, signer);
        try {
            const txResp = await fundMe.fund({value: ethers.utils.parseEther(fund_input.value)});
            // const txRcpt = await txResp.wait(1);
            await listenForTransactionMine(txResp, provider)
            console.log("Done")
        } catch(e) {
            console.log(e)
        }
    } else {
        console.log("No ethereum wallet!")
        connectButton.innerText = "Please install MetaMask"
    }
}

function listenForTransactionMine(txResp, provider) {
    console.log(`Mining ${txResp.hash}`)
    return new Promise((resolve, reject) => {
        provider.once(txResp.hash, function(txRcpt){
            console.log(`Completed with ${txRcpt.confirmations} confirmations`)
            resolve();
        }) 
    })
}

async function balance() {
    if(window.ethereum) {
        await window.ethereum.request({method: "eth_requestAccounts"});
        connectButton.innerText = "Connected!"
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(addr.value);
        balanceShow.innerText = ethers.utils.formatEther(balance);
    } else {
        console.log("No ethereum wallet!")
        connectButton.innerText = "Please install MetaMask"
    }
}

async function withdraw() {
    if(window.ethereum) {
        await window.ethereum.request({method: "eth_requestAccounts"});
        connectButton.innerText = "Connected!"
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        const fundMe = new ethers.Contract(contractAddr, abi, signer);
        try {
            const txResp = await fundMe.withdraw();
            // const txRcpt = await txResp.wait(1);
            await listenForTransactionMine(txResp, provider)
            console.log("Done")
        } catch(e) {
            console.log(e)
        }
    } else {
        console.log("No ethereum wallet!")
        connectButton.innerText = "Please install MetaMask"
    }
}