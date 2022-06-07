const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

module.exports = async function(deployer) {
  // deploying token
  await deployer.deploy(Token);

  const token = await Token.deployed();

  // deploying Swap contract
  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed();

  // transfer all token to the EthSwap (sending 1 million which is the total supply)
  await token.transfer(ethSwap.address, '1000000000000000000000000');
};
