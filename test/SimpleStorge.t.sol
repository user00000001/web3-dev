// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "forge-std/Test.sol";
import {SimpleStorage} from "../src/SimpleStorage.sol";

contract SimpileStorageTest is Test {
    SimpleStorage public ss;

    function setUp() public {
        ss = new SimpleStorage();
    }

    function test_favoriteNumber() public {
        uint256 favoriteNumber_t = 10;
        ss.store(10);
        assertEq(favoriteNumber_t, ss.retrieve(), "favorite number not matched!");
    }

    function test_pushPeople() public {
        vm.expectRevert();
        ss.people(0);

        SimpleStorage.People memory p1 = SimpleStorage.People(1, "Jay");
        ss.addPerson("Jay", 1);
        (uint256 p1_t_favoriteNumber, string memory p1_t_name) = ss.people(0);
        assertEq(p1_t_favoriteNumber, p1.favoriteNumber, "amount of people not matched!");
        assertEq(p1_t_name, p1.name, "amount of people not matched!");

        SimpleStorage.People memory p2 = SimpleStorage.People(2, "Brown");
        ss.addPerson("Brown", 2);
        (uint256 p2_t_favoriteNumber, string memory p2_t_name) = ss.people(1);
        assertEq(p2_t_favoriteNumber, p2.favoriteNumber, "amount of people is not matched!");
        assertEq(p2_t_name, p2.name, "amount of people is not matched!");

        vm.expectRevert();
        ss.people(2);
    }
}
