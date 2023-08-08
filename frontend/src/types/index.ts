export interface INetwork {
  id: number
  name: string
  currency: IToken
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export interface IToken {
  name: string
  symbol: string
  decimals: number
  image: string
}

export interface ISwapTokenInfo {
  decimals: number
  rate: number
  symbol: string
}

export interface ISwapTokenInfoWithAddr extends ISwapTokenInfo {
  address: string
}
