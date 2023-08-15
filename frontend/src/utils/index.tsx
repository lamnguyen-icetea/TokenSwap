import Web3 from 'web3'
import { SEPOLIA_TESTNET } from '../constants'
import { ISwapTokenInfo, ISwapTokenInfoWithAddr } from '../types'

export const toHex = (dec: number) => {
  return `0x${dec.toString(16)}`
}

export const maskAddress = (address: string, start = 6, end = 6) => {
  if (!address || address === undefined || address.length === 0) return ''
  if (start + end >= address.length) return address

  const first = address?.substring(0, start)
  const second = address?.substring(address.length - end, address.length)
  return first + '...' + second
}

export const getWeb3 = () => {
  return new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if ((window as any).ethereum) {
        const web3 = new Web3((window as any).ethereum)
        try {
          // Request account access if needed
          await (window as any).ethereum.enable()
          // Accounts now exposed
          resolve(web3)
        } catch (error) {
          reject(error)
        }
      }
      // Legacy dapp browsers...
      else if ((window as any).web3) {
        // Use Mist/MetaMask's provider.
        const web3 = (window as any).web3
        console.log('Injected web3 detected.')
        resolve(web3)
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
        const web3 = new Web3(provider)
        console.log('No web3 instance injected, using Local web3.')
        resolve(web3)
      }
    })
  })
}

export const switchNetwork = async (chainId: number, web3: any) => {
  const currentChainId = await web3.eth.net.getId()

  if (currentChainId !== chainId) {
    try {
      await web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHex(chainId) }],
      })
    } catch (error) {
      if (error.code === 4902) {
        try {
          await web3.currentProvider.request({
            method: 'wallet_addEtherumChain',
            params: [
              {
                chainId: toHex(chainId),
                chainName: SEPOLIA_TESTNET.name,
                nativeCurrency: SEPOLIA_TESTNET.currency,
                rpcUrls: SEPOLIA_TESTNET.rpcUrls,
                blockExplorerUrls: SEPOLIA_TESTNET.blockExplorerUrls,
              },
            ],
          })
        } catch (error) {
          console.debug(error)
        }
      }
    }
  }
}

export const handleTokensInfo = (info: ISwapTokenInfo[], tokens: string[]) => {
  let result: ISwapTokenInfoWithAddr[] = []
  for (let i = 0; i < tokens.length; i++) {
    result.push({
      decimals: parseInt(info[i].decimals.toString()),
      rate: parseInt(info[i].rate.toString()),
      symbol: info[i].symbol,
      address: tokens[i],
    })
  }
  return result
}