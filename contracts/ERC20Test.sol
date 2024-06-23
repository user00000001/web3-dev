// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0;

import {ERC20} from "solmate/tokens/ERC20.sol";

contract ERC20Test is ERC20 {
    constructor(uint8 decimals) ERC20("Test Token", "TT", decimals) {}

    function mint(address spender, uint256 amount) public {
        _mint(spender, amount);
    }
}
