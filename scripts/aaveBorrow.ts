import { getNamedAccounts, ethers, network } from "hardhat";
import { AMOUNT, getWeth } from "./getWeth";
import { ILendingPoolAddressesProvider } from "../typechain-types";
import { BigNumber } from "ethers";
import { AggregatorV3Interface, IWeth, IERC20, ILendingPool } from "../typechain-types/contracts/interfaces";
import { networkConfig } from "../helper-hardhat-config";

// windows cmd: set all_proxy=http://127.0.0.1:10809 (your proxy server)
// to fix `failed to get chainId, falling back on net_version... `
// `Error: self sending request for host (mainnet.infura.io): error trying to connect: tcp connect error`

async function main() {
    const iWeth: IWeth = await getWeth();
    const { deployer } = await getNamedAccounts();
    const lendingPool: ILendingPool = await getLendingPool(deployer);
    await approveERC20(iWeth.address, lendingPool.address, AMOUNT, deployer)
    console.log("Depositing...")
    await lendingPool.deposit(iWeth.address, AMOUNT, deployer, 0)
    console.log("Deposited!")
    const { availableBorrowsETH } = await getBorrowUserData(lendingPool, deployer)
    const daiPrice = await getDaiPrice();
    // @ts-ignore
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * ( 1 / daiPrice.toNumber() );
    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`);
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());
    const daiTokenAddress = networkConfig[network.config.chainId!]["daiToken"]!
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer)
    const { totalDebtETH } = await getBorrowUserData(lendingPool, deployer) 
    await repay(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer)
    await getBorrowUserData(lendingPool, deployer) // totalDebtETH remains ?
}

async function repay(daiAddress: string, lendingPool: ILendingPool, amount: BigNumber, account: string) {
    await approveERC20(
        daiAddress,
        lendingPool.address,
        amount,
        account
    )
    const repayTx = await lendingPool.repay(daiAddress, amount, 2, account)
    await repayTx.wait(1)
    console.log("Repayed!")
}

async function borrowDai(
    daiAddress: string,
    lendingPool: ILendingPool,
    amountDaiToBorrowWei: BigNumber,
    account: string,
) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 2, 0, account) // stable: 1, reverted with reason string '12', see https://docs.aave.com/developers/v/2.0/guides/troubleshooting-errors
    // reverted with reason string 'SafeERC20: low-level call failed', sometimes may pass it.
    await borrowTx.wait(1);
    console.log("You've borrowed!");
}

async function getDaiPrice() {
    const daiEthPriceFeed: AggregatorV3Interface = await ethers.getContractAt(
        "contracts/interfaces/AggregatorV3Interface.sol:AggregatorV3Interface",
        networkConfig[network.config.chainId!]["daiEthPriceFeed"]!
    );
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${ 1 / parseFloat(ethers.utils.formatUnits(price, 18))}`);
    return price
}

async function getLendingPool(account: string): Promise<ILendingPool> {
    const iLendingPoolAddressesProvider: ILendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.config.chainId!]["lendingPoolAddressesProvider"]!,
        account
    )
    const lendingPoolAddress = await iLendingPoolAddressesProvider.getLendingPool()
    console.log(`LendingPoolAddress: ${lendingPoolAddress}`)
    const lendingPool: ILendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )
    return lendingPool;
}

async function getBorrowUserData(lendingPool: ILendingPool, account: string) {
    const {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH,
    } = await lendingPool.getUserAccountData(account);
    console.log(`totalCollateralETH: ${ethers.utils.formatEther(totalCollateralETH)}, ` +
     `\ntotalDebtETH: ${ethers.utils.formatEther(totalDebtETH)}, ` + 
     `\navailableBorrowsETH: ${ethers.utils.formatEther(availableBorrowsETH)}`)
    return { availableBorrowsETH, totalDebtETH }
}

async function approveERC20(contractAddress: string, spenderAddress: string, amountTospeend: BigNumber, account: string) {
    const contract: IERC20 = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20", contractAddress, account);
    contract.approve(spenderAddress, amountTospeend);
    const decimals = await contract.decimals();
    const name = await contract.name();
    const symbol = await contract.symbol();
    const tokens = ethers.utils.formatUnits(amountTospeend, decimals);
    console.log(`approved ${tokens} ${symbol}s at ${contractAddress}(${name}) \nfrom ${account} to ${spenderAddress}`)
}

main().then(()=>process.exit(0))
    .catch((error)=>{
        console.error(error);
        process.exit(1);
    })