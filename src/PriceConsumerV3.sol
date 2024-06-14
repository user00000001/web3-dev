// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title The PriceConsumerV3 contract
 * @author
 * @notice A contract that returns latest price from Chainlink Price Feeds
 */
contract PriceConsumerV3 {
    AggregatorV3Interface internal immutable priceFeed;

    /**
     * @notice Executes once when a contract is created to initialize state variable
     *
     * @param _priceFeed - Price Feed Address
     */
    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /**
     * @notice Returns the latest price
     * @return - latest price
     */
    function getLatestPrice() public view returns (int256) {
        (
            /* uint80 roundID */
            ,
            int256 price,
            /* uint256 startedAt */
            ,
            /* uint256 timestamp */
            ,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        return price;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
