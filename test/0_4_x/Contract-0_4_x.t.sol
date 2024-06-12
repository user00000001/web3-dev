// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {WETH9} from "./IContract.sol";

contract Name1 is Test {
    WETH9 c;

    function setUp() public {
        c = WETH9(deployCode("Contract.sol:WETH9"));
    }

    function test_decimals() public {
        assertEq(c.decimals(), 18, "decimals not 18");
    }

    function test_name() public {
        string memory t_name = "Wrapped Ether";
        assertEq(c.name(), t_name, "name not matched");
    }

    function test_symbol() public {
        string memory t_symbol = "WETH";
        assertEq(c.symbol(), t_symbol, "symbol not matched");
    }
}

contract Name is Test {
    address c;

    function setUp() public {
        c = deployCode("Contract.sol:WETH9");
    }

    function test_decimals() public {
        console.log("Address: %s", c);
        (bool success, bytes memory bm) = c.call(abi.encode(bytes4(keccak256("decimals()"))));
        uint8 decimals = abi.decode(bm, (uint8));
        console.log("%s %s", success, decimals);
        assertEq(decimals, 18, "decimals not 18");
    }

    function test_name() public {
        string memory t_name = "Wrapped Ether";
        (bool success, bytes memory bm) = c.call(abi.encode(bytes4(keccak256("name()"))));
        string memory name = abi.decode(bm, (string));
        console.log("%s %s", success, name);
        assertEq(name, t_name, "name not matched");
    }

    function test_symbol() public {
        string memory t_symbol = "WETH";
        (bool success, bytes memory bm) = c.call(abi.encode(bytes4(keccak256("symbol()"))));
        string memory symbol = abi.decode(bm, (string));
        console.log("%s %s", success, symbol);
        assertEq(symbol, t_symbol, "symbol not matched");
    }
}
