import { INetwork, IToken } from '../types'

export const TOKEN_A_CONTRACT = process.env.REACT_APP_TKA_CONTRACT
export const TOKEN_B_CONtRACT = process.env.REACT_APP_TKB_CONTRACT
export const SWAP_CONTRACT = process.env.REACT_APP_SWAP_CONTRACT
export const PREFERED_NETWORK_ID = 11155111

export const CMC_ASSETS_DOMAIN = 's2.coinmarketcap.com'

export const SETH: IToken = {
  name: 'Sepolia ETH',
  symbol: 'SepoliaETH',
  decimals: 18,
  image: `https://${CMC_ASSETS_DOMAIN}/static/img/coins/64x64/1027.png`,
}

export const SEPOLIA_TESTNET: INetwork = {
  id: 11155111,
  name: 'Sepolia Test Network',
  currency: SETH,
  rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/11b51c368b9144f1a06dbbe3235cbcd4'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
}
