// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol" as AV3I;
import "./PriceConverter.sol" as PC;

error NotOwner();
error ETHNotEnough();
error CallFailure();

contract FundMe {
    using PC.PriceConverter for uint256;

    mapping (address => uint256) public addressToAmountFunded;
    address[] public funders;

    address public immutable I_OWNER;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    AV3I.AggregatorV3Interface priceFeed;

    constructor(AV3I.AggregatorV3Interface priceFeedAddr) {
        I_OWNER = msg.sender;
        priceFeed = priceFeedAddr;
    }

    function fund() public payable {
        // require(msg.value.getConversionRate() >= MINIMUM_USD, "You need to spend more ETH!");
        if(msg.value.getConversionRate(priceFeed) < MINIMUM_USD) revert ETHNotEnough();
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function getVersion() public view returns(uint256) {
        // ETH/USD price feed address of Sepolia Network.
        // AV3I.AggregatorV3Interface priceFeed = AV3I.AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        return priceFeed.version();
    }

    modifier onlyOwner {
        // require(msg.sender == i_owner, "Not Owner!");
        if (msg.sender != I_OWNER) revert NotOwner();
        _;
    }

    function withdraw() public onlyOwner {
        for(uint256 funderIndex=0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        // require(callSuccess, "Call failed");
        if(!callSuccess) revert CallFailure();
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }
    receive() external payable {
        fund();
    }
}
