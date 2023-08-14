import { useState } from 'react'
import { ISwapTokenInfoWithAddr } from '../../types'
import { ethers } from 'ethers'

interface IProps {
  tokensInfo: ISwapTokenInfoWithAddr[]
  getRate: (token: string) => Promise<number>
  sellToken: (token: string, amount: any) => Promise<void>
  approveToken: (token: string, amount: any) => Promise<void>
}

const Sell = ({ tokensInfo, getRate, sellToken, approveToken }: IProps) => {
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

  const handleSell = async () => {
    const valid = validateAmount()
    if (!valid) return
    try {
      setLoading(true)
      const address = selectedToken.address
      const rate = await getRate(address)
      if (rate <= 0) return

      const weiAmount = ethers.parseUnits(amount.toString(), selectedToken.decimals)

      await approveToken(address, weiAmount)
      await sellToken(address, weiAmount)
      setAmount(0)
      setLoading(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='mb-2'>Please select token you want to sell</div>
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

          <div>Estimated receiving ETH (exchange rates may vary): {amount / selectedToken.rate} ETH</div>
          {errorMsg && <div className='text-red-600'>{errorMsg}</div>}
          <button
            className={`w-20 mx-auto border border-black rounded bg-gray-100 ${loading && 'cursor-progress'}`}
            disabled={loading}
            onClick={handleSell}
          >
            {loading ? 'Loading...' : 'Sell'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Sell
