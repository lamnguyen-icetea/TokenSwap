import { useEffect, useState } from 'react'
import { ISwapTokenInfoWithAddr } from '../types'
import { handleTokensInfo } from '../utils'
import UserTokensTable from './user/UserTokensTable'
import Sell from './user/Sell'
import Buy from './user/Buy'
import Swap from './user/Swap'
import ERC20ABI from './../contracts/ERC20ABI.json'

interface IProps {
  web3: any
  accounts: string[]
  tokenSwapAddress: string
  tokenSwapInstance: any
}

const User = ({ web3, accounts, tokenSwapAddress, tokenSwapInstance }: IProps) => {
  const [tokensInfo, setTokensInfo] = useState<ISwapTokenInfoWithAddr[]>([])
  const [tokensList, setTokensList] = useState<string[]>([])
  const [currentTab, setCurrentTab] = useState<string>('buy')

  const getTokensInfo = async () => {
    const info = await tokenSwapInstance.methods.getTokensDetail().call()
    const tokens = await tokenSwapInstance.methods.getTokensList().call()
    const tokensInfo = handleTokensInfo(info, tokens)
    console.log(tokensInfo)
    setTokensList(tokens)
    setTokensInfo(tokensInfo)
  }

  const buyToken = async (token: string, value: any) => {
    try {
      await tokenSwapInstance.methods.buyToken(token).send({ from: accounts[0], value: value })
    } catch (error) {
      console.debug(error)
    }
  }

  const sellToken = async (token: string, amount: any) => {
    console.log(token, amount)
    try {
      await tokenSwapInstance.methods.sellToken(token, amount).send({ from: accounts[0] })
    } catch (error) {
      console.debug(error)
    }
  }

  const swapToken = async (swap: string, receive: string, amount: any) => {
    try {
      await tokenSwapInstance.methods.swapToken(swap, receive, amount).send({ from: accounts[0] })
    } catch (error) {
      console.debug(error)
    }
  }

  const getRate = async (token: string) => {
    try {
      const res = await tokenSwapInstance.methods.getTokenRate(token).call()
      const rate = parseInt(res.toString())
      return rate
    } catch (error) {
      console.debug(error)
      return -1
    }
  }

  const approveToken = async (token: string, amount: any) => {
    try {
      const tokenInstance = new web3.eth.Contract(ERC20ABI, token)
      await tokenInstance.methods.approve(tokenSwapAddress, amount).send({ from: accounts[0] })
    } catch (error) {
      console.debug(error)
    }
  }

  useEffect(() => {
    getTokensInfo()
  }, [])

  return (
    <div className='px-16 py-10'>
      <UserTokensTable tokensInfo={tokensInfo} />
      <div className='mt-8 mb-4 flex justify-center'>
        <div className={`w-24 text-center ${currentTab === 'buy' && 'font-bold'}`} onClick={() => setCurrentTab('buy')}>
          Buy
        </div>
        <div
          className={`w-24 text-center ${currentTab === 'sell' && 'font-bold'}`}
          onClick={() => setCurrentTab('sell')}
        >
          Sell
        </div>
        <div
          className={`w-24 text-center ${currentTab === 'swap' && 'font-bold'}`}
          onClick={() => setCurrentTab('swap')}
        >
          Swap
        </div>
      </div>
      {currentTab === 'buy' && <Buy tokensInfo={tokensInfo} getRate={getRate} buyToken={buyToken} />}
      {currentTab === 'sell' && (
        <Sell tokensInfo={tokensInfo} getRate={getRate} sellToken={sellToken} approveToken={approveToken} />
      )}
      {currentTab === 'swap' && <Swap tokensInfo={tokensInfo} getRate={getRate} swapToken={swapToken} approveToken={approveToken} />}
    </div>
  )
}

export default User
