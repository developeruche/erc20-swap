pragma solidity ^0.5.0;

contract Token {
    string  public name = "ERC20SWAP Token";
    string  public symbol = "ESP";
    uint256 public totalSupply = 1000000000000000000000000; // 1 million tokens
    uint8   public decimals = 18;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    ); // this would be logged in the blockchian event center and frontend application can make use of this

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    ); // when a user approval a send of token it would be logged on the blockchain event

    mapping(address => uint256) public balanceOf; // this store the balance of all the token holders mapping the address to the amount of token
    mapping(address => mapping(address => uint256)) public allowance; // this stores the addresses approved to send on behalve of other addresses

    constructor() public {
        balanceOf[msg.sender] = totalSupply; // when the contract is init the totalSupply of the token would be allocated to who initiated the contract
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}