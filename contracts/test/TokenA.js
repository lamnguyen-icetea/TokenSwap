const TokenA = artifacts.require("TokenA");
const { ethers } = require("ethers");

contract("TokenA", (accounts) => {
  const initialSupply = 1000000;
  const mintAmount = 1000000;
  let decimals = 0;
  let user = accounts[1];
  let contractInstance;

  beforeEach(async () => {
    contractInstance = await TokenA.new();
    const result = await contractInstance.decimals();
    decimals = result.toNumber();
  })

  it("total supply should be equal to initial supply", async function () {
    const result = await contractInstance.totalSupply();
    assert.equal(result, ethers.parseUnits(initialSupply.toString(), decimals));
  })

  it("should mint tokens for user", async function () {
    await contractInstance.mint(user, ethers.parseUnits(mintAmount.toString(), decimals));
    const balance = await contractInstance.balanceOf(user);
    assert.equal(balance, ethers.parseUnits(mintAmount.toString(), decimals));
  })
})