import React, { useEffect, useState } from 'react'
import './App.css'
import { getWeb3, switchNetwork } from './utils'
import { PREFERED_NETWORK_ID } from './constants'
import TokenSwap from './contracts/TokenSwap.json'
import Header from './components/common/Header'
import Admin from './components/Admin'
import User from './components/User'
import Loading from './components/common/Loading'

function App() {
  const [web3, setWeb3] = useState<any>()
  const [accounts, setAccounts] = useState<string[]>([])
  const [networkId, setNetworkId] = useState<number>()
  const [tokenSwapAddress, setTokenSwapAddress] = useState<string>()
  const [tokenSwapInstance, setTokenSwapInstance] = useState<any>()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  ;(window as any).ethereum.on('accountsChanged', async function () {
    window.location.reload()
  })

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const web3: any = await getWeb3()
        await switchNetwork(PREFERED_NETWORK_ID, web3)
        const accounts = await web3.eth.getAccounts()
        const networkId = await web3.eth.net.getId()
        const tokenSwapAddress = TokenSwap.networks[networkId]?.address
        const tokenSwapInstance = new web3.eth.Contract(TokenSwap.abi, tokenSwapAddress)
        const isAdmin = await tokenSwapInstance.methods.isAdmin().call({ from: accounts[0] })

        setWeb3(web3)
        setAccounts(accounts)
        setNetworkId(networkId)
        setTokenSwapAddress(tokenSwapAddress)
        setTokenSwapInstance(tokenSwapInstance)
        setIsAdmin(isAdmin)
        setLoading(false)
      } catch (error) {
        console.debug(error)
      }
    }

    init()
  }, [])

  if (web3 && accounts && tokenSwapInstance && !loading) {
    if (isAdmin) {
      return (
        <div className='bg-gray-200 h-screen'>
          <Header accounts={accounts} isAdmin={isAdmin} />
          <main>
            <Admin
              web3={web3}
              accounts={accounts}
              tokenSwapAddress={tokenSwapAddress}
              tokenSwapInstance={tokenSwapInstance}
            />
          </main>
        </div>
      )
    } else {
      return (
        <div className='bg-gray-200 h-screen'>
          <Header accounts={accounts} isAdmin={isAdmin} />
          <main>
            <User
              web3={web3}
              accounts={accounts}
              tokenSwapAddress={tokenSwapAddress}
              tokenSwapInstance={tokenSwapInstance}
            />
          </main>
        </div>
      )
    }
  } else {
    return (
      <div className='bg-gray-200 h-screen'>
        <Loading />
      </div>
    )
  }
}

export default App
