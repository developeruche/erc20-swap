pragma solidity ^0.5.0;
import "./Token.sol";

contract EthSwap {
    string public name = "ERC Instance Exchange";
    Token public token; // creating a variable representing the smart contract;
    uint public rate = 100;

    event TokenPurchased(
        address account, address token, uint amount, uint rate
    );

    event TokenSold(
        address account, address token, uint amount, uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // redemtion rate is the number of token they receive for one ether
        // token amount = amount of ether * redemption rate
        // Calculating the number of token that can be bought
        uint tokenAmount = msg.value * rate;

        require(token.balanceOf(address(this)) >= tokenAmount);
        
        token.transfer(msg.sender, tokenAmount);

        // Trigger an event that token was purchased
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // User cannot sell more token then they have
        require(token.balanceOf(msg.sender) >= _amount);
        // Calculating the amount of Ether to be redeem
        uint etherAmount = _amount / rate;

        require(address(this).balance >= etherAmount);


        // performing the sale 
        token.transferFrom(msg.sender, address(this), _amount);

        // Now the token has been redeemed, the ether can now be sen to the user
        msg.sender.transfer(etherAmount);

        emit TokenSold(msg.sender, address(token), _amount, rate);

    }
}