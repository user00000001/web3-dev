//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {ProxyAdmin} from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract BoxProxyAdmin is ProxyAdmin {
    constructor(address /* owner */) ProxyAdmin() {
        // We just need this for our hardhat tooling right now
    }
}

contract Box {
    uint256 internal value;

    event ValueChanged(uint256 newValue);

    function store(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }

    function retrieve() public view returns (uint256) {
        return value;
    }

    function version() public pure virtual returns (uint256) {
        return 1;
    }
}

contract BoxV2 is Box {
    function increment() public {
        value = value + 1;
        emit ValueChanged(value);
    }

    function version() public pure override returns (uint256) {
        return 2;
    }
}
