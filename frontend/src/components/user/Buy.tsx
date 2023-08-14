import { useState } from 'react'
import { ISwapTokenInfoWithAddr } from '../../types'
import { ethers } from 'ethers'

interface IProps {
  tokensInfo: ISwapTokenInfoWithAddr[]
  getRate: (token: string) => Promise<number>
  buyToken: (token: string, value: any) => Promise<void>
}

const Buy = ({ tokensInfo, getRate, buyToken }: IProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<ISwapTokenInfoWithAddr>()
  const [amount, setAmount] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const handleSelect = (token: string) => {
    const selected = tokensInfo.find((item) => item.address === token)
    setAmount(0)
    setSelectedToken(selected)
  }

  const validateAmount = () => {
    if (!amount || amount <= 0) {
      setErrorMsg('Amount must be greater than 0.')
      return false
    }
    setErrorMsg('')
    return true
  }

  const handleBuy = async () => {
    const valid = validateAmount()
    if (!valid) return
    try {
      setLoading(true)
      const rate = await getRate(selectedToken.address)
      if (rate <= 0) return

      const weiValue = ethers.parseEther((amount / rate).toString())

      await buyToken(selectedToken.address, weiValue)
      setAmount(0)
      setLoading(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='mb-2'>Please select token you want to buy</div>
      <select
        className='w-40 mb-4'
        value={selectedToken?.address || 'default'}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option disabled selected value='default' className='hidden'>
          {' '}
          -- select a token --{' '}
        </option>
        {tokensInfo.map((token) => {
          return (
            <option key={token.address} value={token.address}>
              {token.symbol}
            </option>
          )
        })}
      </select>
      {selectedToken && (
        <div className='flex flex-col gap-1'>
          <div>{`Selected: ${selectedToken.symbol} (${selectedToken.address})`}</div>
          <div>
            <label className='mr-2'>Amount:</label>
            <input
              className='px-2'
              disabled={loading}
              type='number'
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.valueAsNumber)}
            />
          </div>
          <div>Estimated cost (exchange rates may vary): {amount / selectedToken.rate} ETH</div>
          {errorMsg && <div className='text-red-600'>{errorMsg}</div>}
          <button
            className={`w-20 mx-auto border border-black rounded bg-gray-100 ${loading && 'cursor-progress'}`}
            disabled={loading}
            onClick={handleBuy}
          >
            {loading ? 'Loading...' : 'Buy'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Buy
