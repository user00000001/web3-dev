// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

interface tokenRecipient {
    function receiveApproval(address _from, uint256 _value, address _token, bytes calldata _extraData) external;
}

/**
 * @title Manual Token Sample
 * @author
 * @notice To explain ERC20
 */
contract ManualToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance; // just a record, doesn't own tokens

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Burn(address indexed from, uint256 value);

    /**
     *
     * @param initialSupply Integer Amounts of Tokens
     * @param tokenName Token Name
     * @param tokenSymbol Token Symbol
     */
    constructor(uint256 initialSupply, string memory tokenName, string memory tokenSymbol) {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        name = tokenName;
        symbol = tokenSymbol;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0));
        require(balanceOf[_from] > _value);
        require(balanceOf[_to] + _value >= balanceOf[_to]);
        uint256 previousBalances = balanceOf[_from] + balanceOf[_to];
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    /**
     *
     * @param to transfer sender's tokens to this address.
     * @param _value transfer how many tokens to this `to` address
     */
    function transfer(address to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, to, _value);
        return true;
    }

    /**
     *
     * @param _from address in allowance mapping which owns sender's token
     * @param _to to
     * @param _value amount
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= allowance[_from][msg.sender]);
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    /**
     *
     * @param _spender allow _spender to transferFrom sender's allowance
     * @param _value amount
     */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // allowance[msg.sender][_spender] += _value; // may already have some allowance. some overflow bugs.
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     *
     * @param _spender spender is a contract and implements the interface method receiveApproval(may have emit a event and listener to handle this event)
     * @param _value amount
     * @param _extraData extra data to notify.
     */
    function approveAndCall(address _spender, uint256 _value, bytes memory _extraData) public returns (bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, address(this), _extraData);
            return true;
        }
    }

    /**
     *
     * @param _value Burn some tokens from sender's and ManualToken's amount.
     */
    function burn(uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        emit Burn(msg.sender, _value);
        return true;
    }

    /**
     *
     * @param _from from the allowance that sender owns
     * @param _value the amount
     */
    function burnFrom(address _from, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        allowance[_from][msg.sender] -= _value;
        totalSupply -= _value;
        emit Burn(_from, _value);
        return true;
    }
}
