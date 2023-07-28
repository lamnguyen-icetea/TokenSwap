// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract TokenSwap {
  address payable admin;

  struct TokenInfo {
    uint256 decimals; // decimals of token
    uint256 rate; // number of tokens traded with 1 ETH
  }

  // unorderd array for storing address of configured tokens
  address[] public tokens;
  
  // value of token in ETH
  mapping (address => TokenInfo) public TokenAddressToInfo;

  event AdminChanged(address newAdmin);
  event TokenInfoChanged(address token, uint256 decimals, uint256 rate);
  event TokenSwapped(address tokenSwap, address tokenReceive, uint256 amountSwap, uint256 amountReceive);
  event TokenBought(address token, uint256 value, uint256 buyAmount);
  event TokenSold(address token, uint256 sellAmount, uint256 sellValue);
  event Received(address sender, uint256 value);

  modifier onlyAdmin() {
    require(payable(msg.sender) == admin, "Not an admin!");
    _;
  }

  // using address(0) for ETH's mapping key
  constructor() {
    admin = payable(msg.sender);
    TokenAddressToInfo[address(0)].decimals = 18;
    TokenAddressToInfo[address(0)].rate = 1;
  }

  // check if sender is admin
  function isAdmin() external view returns(bool) {
    return msg.sender == address(admin);
  }

  // allow admin to choose a new admin
  function changeAdmin(address _newAdmin) external onlyAdmin {
    admin = payable(_newAdmin);
    emit AdminChanged(_newAdmin);
  }

  // check if provided address is an ERC20 tokensellAmount
  function isERC20(address _addr) internal view returns(bool) {
    IERC20Metadata ERC20ContractInstance = IERC20Metadata(_addr);
    return ERC20ContractInstance.totalSupply() > 0;
  }

  // admin set exchange rate of token with ETH
  function setTokenAddressToInfo(address _token, uint256 _rate) external onlyAdmin {
    require(isERC20(_token), "Not an ERC20 token!");
    require(_rate > 0, "Rate must be more than zero!");

    IERC20Metadata ERC20ContractInstance = IERC20Metadata(_token);
    uint256 tokenDecimals = ERC20ContractInstance.decimals();

    if (TokenAddressToInfo[_token].rate == 0) {
      tokens.push(_token);
    }
    TokenAddressToInfo[_token].rate = _rate;
    if (tokenDecimals != TokenAddressToInfo[_token].decimals) {
      TokenAddressToInfo[_token].decimals = tokenDecimals;
    }
    
    emit TokenInfoChanged(_token, tokenDecimals, _rate);
  }

  // admin remove a token(make token unswappable)
  function removeTokenAddressToInfo(address _token) external onlyAdmin {
    require(TokenAddressToInfo[_token].rate > 0, "This token doesn't have any info.");

    TokenAddressToInfo[_token].rate = 0;
    if (TokenAddressToInfo[_token].decimals != 0) {
      TokenAddressToInfo[_token].decimals = 0;
    }
    
    deleteAddressFromTokens(_token);
  }

  // get decimals of token
  function getTokenAddressToInfoDecimals(address _token) public view returns(uint256) {
    return TokenAddressToInfo[_token].decimals;
  }

  // get exchange rate of token with ETH
  function getTokenAddressToInfoRate(address _token) public view returns(uint256) {
    return TokenAddressToInfo[_token].rate;
  }

  // get list of configured tokens
  function getTokensList() external view returns(address[] memory) {
    return tokens;
  }

  // swap _amountSwap _tokenSwap to _tokenReceive
  function swapToken(address _tokenSwap, address _tokenReceive, uint256 _amountSwap) external {
    // validate token address
    require(isERC20(_tokenSwap), "Swapping token address is not an ERC20 token!");
    require(isERC20(_tokenReceive), "Receiving token address is not an ERC20 token!");
    // check if swapping amount is greater than 0
    require(_amountSwap > 0, "Swapping amount must be more than zero.");

    // check if 2 tokens already had exchange rate configured
    require(getTokenAddressToInfoRate(_tokenSwap) > 0, "Swapping token rate is not set.");
    require(getTokenAddressToInfoRate(_tokenReceive) > 0, "Receiving token rate is not set.");

    IERC20Metadata TokenSwapContractInstance = IERC20Metadata(_tokenSwap);
    IERC20Metadata TokenReceiveContractInstance = IERC20Metadata(_tokenReceive);
    // check if sender has enough token in wallet swap
    require(TokenSwapContractInstance.balanceOf(msg.sender) >= _amountSwap, "Sender does not have enough tokens.");
    require(TokenSwapContractInstance.allowance(msg.sender, address(this)) >= _amountSwap, "Not enough allowance");

    uint256 receiveAmount = calculateTransferAmount(_tokenSwap, _tokenReceive, _amountSwap);

    // check if contract has enough contract to swap
    require(TokenReceiveContractInstance.balanceOf(address(this)) >= receiveAmount, "Contract doesn't currently have enough tokens.");
    
    // receive token from sender
    TokenSwapContractInstance.transferFrom(msg.sender, address(this), _amountSwap);
    // send exchanged token to sender
    TokenReceiveContractInstance.transfer(msg.sender, receiveAmount);
    emit TokenSwapped(_tokenSwap, _tokenReceive, _amountSwap, receiveAmount);
  }

  function buyToken(address _token) payable external {
    require(isERC20(_token), "Token address is not an ERC20 token!");
    require(msg.value > 0, "No ether was sent.");
    
    uint256 rate = TokenAddressToInfo[_token].rate;
    require(rate > 0, "Token rate is not set.");

    IERC20Metadata TokenContractInstance = IERC20Metadata(_token);
    uint256 buyAmount = calculateTransferAmount(address(0), _token, msg.value);
    require(TokenContractInstance.balanceOf(address(this)) >= buyAmount, "Contract doesn't currently have enough tokens.");

    TokenContractInstance.transfer(msg.sender, buyAmount);
    emit TokenBought(_token, msg.value, buyAmount);
  }

  function sellToken(address _token, uint256 _sellAmount) external {
    require(isERC20(_token), "Token address is not an ERC20 token!");
    require(_sellAmount > 0, "Selling amount must be more than zero.");

    uint256 rate = TokenAddressToInfo[_token].rate;
    require(rate > 0, "Token rate is not set.");

    IERC20Metadata TokenContractInstance = IERC20Metadata(_token);
    require(TokenContractInstance.balanceOf(msg.sender) >= _sellAmount, "Sender does not have enough tokens.");

    uint256 sellValue = calculateTransferAmount(_token, address(0), _sellAmount);
    require(address(this).balance >= sellValue, "Contract doesn't currently have enough ETH.");

    TokenContractInstance.transferFrom(msg.sender, address(this), _sellAmount);
    payable(msg.sender).transfer(sellValue);
    emit TokenSold(_token, _sellAmount, sellValue);
  }

  // amountReceive = _amount * (rateReceive / rateSwap) * (10 ** decimalsReceive) / (10 ** decimalsSwap)
  function calculateTransferAmount(address _tokenSwap, address _tokenReceive, uint256 _amount) internal view returns (uint256) {
    uint256 rateSwap = getTokenAddressToInfoRate(_tokenSwap);
    uint256 rateReceive = getTokenAddressToInfoRate(_tokenReceive);
    uint256 decimalsSwap = getTokenAddressToInfoDecimals(_tokenSwap);
    uint256 decimalsReceive = getTokenAddressToInfoDecimals(_tokenReceive);
    uint256 calculatedAmount = _amount * rateReceive * (10 ** decimalsReceive) / rateSwap / (10 ** decimalsSwap);
    return calculatedAmount;
  }

  function deleteAddressFromTokens(address _addr) internal {
    uint256 tokensLength = tokens.length;
    int256 deletingIndex = -1;

    for (uint256 i = 0; i < tokensLength; i++) {
      if (tokens[i] == _addr) {
        deletingIndex = int256(i);
      }
    }

    if (deletingIndex >= 0) {
      tokens[uint256(deletingIndex)] = tokens[tokensLength - 1];
      tokens.pop();
    }
  }

  receive() external payable {
    emit Received(msg.sender, msg.value);
  }
}
