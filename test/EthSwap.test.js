const { assert } = require('chai');

// Importing the smart contracts
const Token = artifacts.require('Token');
const EthSwap = artifacts.require('EthSwap');

// configuring chai (this is the assertion lib)
require('chai')
    .use(require('chai-as-promised'))
    .should()


function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap;

    before(async () => {
        token = await Token.new();
        ethSwap = await EthSwap.new(token.address);

        // Transfering all the token to ethswap contract
        await token.transfer(ethSwap.address, tokens('1000000'));
    });

    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const token = await Token.new();
            const name = await token.name();
            assert.equal(name, "ERC20SWAP Token");
        });
    });

    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name();
            assert.equal(name, "ERC Instance Exchange");
        });

        it('token have been sent to the exchange contract', async () => {
            let balance = await token.balanceOf(ethSwap.address);
            assert.equal(balance.toString(), tokens('1000000'));
        });
    });

    describe('buyTokens()', async () => {
        // Purchase tokens before each example
        let result;

        before(async () => {
            result = await ethSwap.buyTokens({from: investor, value: web3.utils.toWei('1', 'ether')});
        });

        it('This allows users to buy tokens from ethSwap using a fixed price of ether', async () => {
            // check if the investor recieved the token
            let investorBalance = await token.balanceOf(investor);
            assert.equal(investorBalance.toString(), tokens('100'));

            // check if ethSwap contract was debted
            let ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens('999900'));

            // checking if ether was sent tot the contract
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'));
            
            const event = result.logs[0].args;

            // Checking if the event for validation purposes
            assert.equal(event.account, investor);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens('100').toString());
            assert.equal(event.rate.toString(), "100");
        });
    });

    describe('sellTokens()', async () => {
        let result;

        before(async () => {
            // Investor most approve tokens before the purchase
            await token.approve(ethSwap.address, tokens('100'), {from: investor});
            
            // investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), { from: investor});
        });

        it('This allows users to sell tokens to ethSwap using a fixed price of ether', async () => {
            // check if the token balance was changed
            let investorBalance = await token.balanceOf(investor);
            assert.equal(investorBalance.toString(), tokens('0'));

            // check if the ether balance was changed
            let ethSwapBalance;
            ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens('1000000'));

            // checking if ether was sent tot the contract
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'));
            

            // Checking log to see if the event was emitted with the correct data
            const event = result.logs[0].args;
            assert.equal(event.account, investor);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens('100').toString());
            assert.equal(event.rate.toString(), "100");


            // Investor cannot sell more token then they have
            await ethSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
        });
    });
});