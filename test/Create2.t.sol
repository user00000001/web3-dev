// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {Lock} from "../contracts/Lock.sol";
import {Create2} from "../contracts/Create2.sol";

contract Create2Test is Test {
    Create2 internal create2;
    Lock internal lock;
    uint256 internal unlockTime = block.timestamp + 1 days;

    function setUp() public {
        create2 = new Create2();
        lock = new Lock(unlockTime);
    }

    function testDeterministicDeploy() public {
        vm.deal(address(0x1), 100 ether);

        vm.startPrank(address(0x1));
        bytes32 salt = "12345";
        bytes memory creationCode = abi.encodePacked(type(Lock).creationCode, unlockTime);

        address computedAddress = create2.computeAddress(salt, keccak256(creationCode)); // keccak256(0xff ++ address ++ salt ++ keccak256(bytecode))[12:]
        address deployedAddress = create2.deploy(salt, creationCode);
        vm.stopPrank();
        // emit log_address(deployedAddress); // see Logs: -vv
        emit log_named_address("computedAddress", computedAddress);
        emit log_named_address("deployedAddress", deployedAddress);
        assertEq(computedAddress, deployedAddress);
    }
}
