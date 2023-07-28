const TokenSwap = artifacts.require("TokenSwap");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const { ethers } = require("ethers");


contract("TokenSwap", (accounts) => {
  const admin = accounts[0];
  const user = accounts[1];
  let TokenSwapInstance;

  beforeEach(async () => {
    TokenSwapInstance = await TokenSwap.new();
  })

  context("isAdmin function test has 2 cases", async () => {
    it("should return false when provided address is not admin", async () => {
      const result = await TokenSwapInstance.isAdmin({ from: user });
      assert.equal(result, false);
    })

    it("should return true when provided address is admin", async () => {
      const result = await TokenSwapInstance.isAdmin({ from: admin });
      assert.equal(result, true);
    })
  })

  it("should transfer admin role to accounts[2]", async () => {
    await TokenSwapInstance.changeAdmin(accounts[2], { from: admin });
    const newAdmin = await TokenSwapInstance.isAdmin({ from: accounts[2] });
    const oldAdmin = await TokenSwapInstance.isAdmin({ from: admin });
    assert.equal(newAdmin, true);
    assert.equal(oldAdmin, false);
  })

  it("should return correct token decimals", async () => {
    const result = await TokenSwapInstance.getTokenAddressToInfoDecimals(ethers.ZeroAddress);
    assert.equal(result, 18);
  })

  it("should return correct token rate", async () => {
    const result = await TokenSwapInstance.getTokenAddressToInfoRate(ethers.ZeroAddress);
    assert.equal(result, 1);
  })

  it("should be able to set token info", async () => {
    const TokenAInstance = await TokenA.new();
    await TokenSwapInstance.setTokenAddressToInfo(TokenAInstance.address, 10000);
    const TKADecimalsResult = await TokenAInstance.decimals();
    const TKADecimals = TKADecimalsResult.toNumber();
    const decimals = await TokenSwapInstance.getTokenAddressToInfoDecimals(TokenAInstance.address);
    const rate = await TokenSwapInstance.getTokenAddressToInfoRate(TokenAInstance.address);
    assert.equal(decimals, TKADecimals);
    assert.equal(rate, 10000);
  })

  it("should be able to get tokens list", async () => {
    const TokenAInstance = await TokenA.new();
    await TokenSwapInstance.setTokenAddressToInfo(TokenAInstance.address, 10000);
    const TokenBInstance = await TokenB.new();
    await TokenSwapInstance.setTokenAddressToInfo(TokenBInstance.address, 1000);
    const tokens = await TokenSwapInstance.getTokensList();
    assert.deepEqual(tokens, [TokenAInstance.address, TokenBInstance.address]);
  })

  it("should be able to remove a token from list", async () => {
    const TokenAInstance = await TokenA.new();
    await TokenSwapInstance.setTokenAddressToInfo(TokenAInstance.address, 10000);
    const TokenBInstance = await TokenB.new();
    await TokenSwapInstance.setTokenAddressToInfo(TokenBInstance.address, 1000);
    await TokenSwapInstance.removeTokenAddressToInfo(TokenAInstance.address);
    const rateTokenA = await TokenSwapInstance.getTokenAddressToInfoRate(TokenAInstance.address);
    const decimalsTokenA = await TokenSwapInstance.getTokenAddressToInfoDecimals(TokenAInstance.address);
    const tokens = await TokenSwapInstance.getTokensList();
    assert.equal(rateTokenA, 0);
    assert.equal(decimalsTokenA, 0);
    assert.deepEqual(tokens, [TokenBInstance.address]);
  })

  it("should be able to swap from TokenA to TokenB", async () => {
    const TokenAInstance = await TokenA.new();
    await TokenAInstance.mint(user, 10000);

    const TokenBInstance = await TokenB.new();
    await TokenBInstance.mint(TokenSwapInstance.address, 10000);

    await TokenSwapInstance.setTokenAddressToInfo(TokenAInstance.address, 10000);
    await TokenSwapInstance.setTokenAddressToInfo(TokenBInstance.address, 1000);

    await TokenAInstance.approve(TokenSwapInstance.address, 1000, { from: user });
    await TokenSwapInstance.swapToken(TokenAInstance.address, TokenBInstance.address, 1000, { from: user });

    const balanceUserTokenA = await TokenAInstance.balanceOf(user);
    const balanceUserTokenB = await TokenBInstance.balanceOf(user);
    const balanceContractTokenA = await TokenAInstance.balanceOf(TokenSwapInstance.address);
    const balanceContractTokenB = await TokenBInstance.balanceOf(TokenSwapInstance.address);

    assert.equal(balanceUserTokenA, 9000);
    assert.equal(balanceUserTokenB, 100);
    assert.equal(balanceContractTokenA, 1000);
    assert.equal(balanceContractTokenB, 9900);
  })

  it("should be able to buy tokenA with ETH", async () => {
    const TokenAInstance = await TokenA.new();
    await TokenAInstance.mint(TokenSwapInstance.address, 10000);
    await TokenSwapInstance.setTokenAddressToInfo(TokenAInstance.address, 10000);

    await TokenSwapInstance.buyToken(TokenAInstance.address, { from: user, value: 1 });

    const balanceUserTokenA = await TokenAInstance.balanceOf(user);
    const balanceContractTokenA = await TokenAInstance.balanceOf(TokenSwapInstance.address);
    const balanceContractEth = await web3.eth.getBalance(TokenSwapInstance.address);
    assert.equal(balanceUserTokenA, 10000);
    assert.equal(balanceContractTokenA, 0)
    assert.equal(balanceContractEth, 1);
  })

  it("should be able to sell tokenA for ETH", async () => {
    const TokenAInstance = await TokenA.new();
    await TokenAInstance.mint(user, 10000);
    await TokenSwapInstance.setTokenAddressToInfo(TokenAInstance.address, 10000);

    await TokenSwapInstance.send(1);
    await TokenAInstance.approve(TokenSwapInstance.address, 10000, { from: user });
    await TokenSwapInstance.sellToken(TokenAInstance.address, 10000, { from: user });

    const balanceUserTokenA = await TokenAInstance.balanceOf(user);
    const balanceContractTokenA = await TokenAInstance.balanceOf(TokenSwapInstance.address);
    const balanceContractEth = await web3.eth.getBalance(TokenSwapInstance.address);
    assert.equal(balanceUserTokenA, 0);
    assert.equal(balanceContractTokenA, 10000);
    assert.equal(balanceContractEth, 0);
  })
})