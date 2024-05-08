// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract SimpleStorage {
    uint256 private favoriteNumber;
    struct People {
        uint256 favoriteNumber;
        string name;
    }
    People[] private people;
    mapping (string => uint) private nameToFavoriteNumber;
    function addPeople(string memory _name, uint256 _favoriteNumber) public {
        people.push(People(_favoriteNumber, _name));
        nameToFavoriteNumber[_name] = _favoriteNumber;
    }

    function retrieve() view public returns (uint256) {
        return favoriteNumber;
    }

    function store(uint256 _favoriteNumber) public {
        favoriteNumber = _favoriteNumber;
    }
}
