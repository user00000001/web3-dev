// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "solmate/tokens/ERC20.sol";

contract Token_ERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint8 decimals) ERC20(name, symbol, decimals) {}

    function mint(address to, uint256 value) public virtual {
        _mint(to, value);
    }

    function burn(address from, uint256 value) public virtual {
        _burn(from, value);
    }
}

contract SigUtils {
    bytes32 internal DOMAIN_SEPARATOR;

    constructor(bytes32 _DOMAIN_SEPARATOR) {
        DOMAIN_SEPARATOR = _DOMAIN_SEPARATOR;
    }

    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    struct Permit {
        address owner;
        address spender;
        uint256 value;
        uint256 nonce;
        uint256 deadline;
    }

    // computes the hash of a permit
    function getStructHash(Permit memory _permit) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(PERMIT_TYPEHASH, _permit.owner, _permit.spender, _permit.value, _permit.nonce, _permit.deadline)
        );
    }

    // computes the hash of the fully encoded EIP-712 message for the domain, which can be used to recover the signer
    function getTypedDataHash(Permit memory _permit) public view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, getStructHash(_permit)));
    }
}

/// @title Deposit
/// @author kulkarohan
/// @notice Mock contract to transfer ERC-20 tokens with a signed approval
contract Deposit {
    ///                                                          ///
    ///                           EVENTS                         ///
    ///                                                          ///

    /// @notice Emitted after an ERC-20 token deposit
    /// @param user The depositooor
    /// @param tokenContract The token address
    /// @param amount The number of tokens deposited
    event TokenDeposit(address user, address tokenContract, uint256 amount);

    /// @notice Emitted after an ERC-20 token withdraw
    /// @param user The withdrawooor
    /// @param tokenContract The token address
    /// @param amount The number of tokens withdrawn
    event TokenWithdraw(address user, address tokenContract, uint256 amount);

    ///                                                          ///
    ///                           STORAGE                        ///
    ///                                                          ///

    /// @notice The number of tokens stored for a given user and token contract
    /// @dev User => ERC-20 address => Number of tokens deposited
    mapping(address => mapping(address => uint256)) public userDeposits;

    ///                                                          ///
    ///                           DEPOSIT                        ///
    ///                                                          ///

    /// @notice Deposits ERC-20 tokens (requires pre-approval)
    /// @param _tokenContract The ERC-20 token address
    /// @param _amount The number of tokens
    function deposit(address _tokenContract, uint256 _amount) external {
        ERC20(_tokenContract).transferFrom(msg.sender, address(this), _amount);

        userDeposits[msg.sender][_tokenContract] += _amount;

        emit TokenDeposit(msg.sender, _tokenContract, _amount);
    }

    ///                                                          ///
    ///                      DEPOSIT w/ PERMIT                   ///
    ///                                                          ///

    /// @notice Deposits ERC-20 tokens with a signed approval
    /// @param _tokenContract The ERC-20 token address
    /// @param _amount The number of tokens to transfer
    /// @param _owner The user signing the approval
    /// @param _spender The user to transfer the tokens (ie this contract)
    /// @param _value The number of tokens to appprove the spender
    /// @param _deadline The timestamp the permit expires
    /// @param _v The 129th byte and chain id of the signature
    /// @param _r The first 64 bytes of the signature
    /// @param _s Bytes 64-128 of the signature
    function depositWithPermit(
        address _tokenContract,
        uint256 _amount,
        address _owner,
        address _spender,
        uint256 _value,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external {
        ERC20(_tokenContract).permit(_owner, _spender, _value, _deadline, _v, _r, _s);

        ERC20(_tokenContract).transferFrom(_owner, address(this), _amount);

        userDeposits[_owner][_tokenContract] += _amount;

        emit TokenDeposit(_owner, _tokenContract, _amount);
    }

    ///                                                          ///
    ///                           WITHDRAW                       ///
    ///                                                          ///

    /// @notice Withdraws deposited ERC-20 tokens
    /// @param _tokenContract The ERC-20 token address
    /// @param _amount The number of tokens
    function withdraw(address _tokenContract, uint256 _amount) external {
        require(_amount <= userDeposits[msg.sender][_tokenContract], "INVALID_WITHDRAW");

        userDeposits[msg.sender][_tokenContract] -= _amount;

        ERC20(_tokenContract).transfer(msg.sender, _amount);

        emit TokenWithdraw(msg.sender, _tokenContract, _amount);
    }
}
