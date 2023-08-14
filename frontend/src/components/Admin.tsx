import { useEffect, useState } from 'react'
import { ISwapTokenInfoWithAddr } from '../types'
import AdminTokensTable from './admin/AdminTokensTable'
import AddToken from './admin/AddToken'
import { handleTokensInfo } from '../utils'

interface IProps {
  web3: any
  accounts: string[]
  tokenSwapAddress: string
  tokenSwapInstance: any
}

const Admin = ({ web3, accounts, tokenSwapAddress, tokenSwapInstance }: IProps) => {
  const [tokensInfo, setTokensInfo] = useState<ISwapTokenInfoWithAddr[]>([])
  const [tokensList, setTokensList] = useState<string[]>([])

  const getTokensInfo = async () => {
    const info = await tokenSwapInstance.methods.getTokensDetail().call()
    const tokens = await tokenSwapInstance.methods.getTokensList().call()
    const tokensInfo = handleTokensInfo(info, tokens)
    setTokensList(tokens)
    setTokensInfo(tokensInfo)
  }

  const setToken = async (token: string, rate: number) => {
    try {
      await tokenSwapInstance.methods.setTokenAddressToInfo(token, rate).send({ from: accounts[0] })
      await getTokensInfo()
    } catch (error) {
      console.debug(error)
    }
  }

  const removeToken = async (token: string) => {
    try {
      await tokenSwapInstance.methods.removeTokenAddressToInfo(token).send({ from: accounts[0] })
      await getTokensInfo()
    } catch (error) {
      console.debug(error)
    }
  }

  useEffect(() => {
    getTokensInfo()
  }, [])

  return (
    <div className='px-16 py-10'>
      <AdminTokensTable tokensInfo={tokensInfo} setToken={setToken} removeToken={removeToken} />
      <div className='mb-6'></div>
      <AddToken setToken={setToken} tokensList={tokensList} />
    </div>
  )
}

export default Admin
