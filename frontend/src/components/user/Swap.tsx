import { useState } from 'react'
import { ISwapTokenInfoWithAddr } from '../../types'
import { ethers } from 'ethers'

interface IProps {
  tokensInfo: ISwapTokenInfoWithAddr[]
  getRate: (token: string) => Promise<number>
  swapToken: (swap: string, receive: string, amount: any) => Promise<void>
  approveToken: (token: string, amount: any) => Promise<void>
}

const Swap = ({ tokensInfo, getRate, swapToken, approveToken }: IProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedTokenFrom, setSelectedTokenFrom] = useState<ISwapTokenInfoWithAddr>()
  const [selectedTokenTo, setSelectedTokenTo] = useState<ISwapTokenInfoWithAddr>()
  const [amount, setAmount] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const handleSelectFrom = (token: string) => {
    const selected = tokensInfo.find((item) => item.address === token)
    setAmount(0)
    setSelectedTokenFrom(selected)
  }

  const handleSelectTo = (token: string) => {
    const selected = tokensInfo.find((item) => item.address === token)
    setSelectedTokenTo(selected)
  }

  const validateAmount = () => {
    if (!amount || amount <= 0) {
      setErrorMsg('Amount must be greater than 0.')
      return false
    }
    setErrorMsg('')
    return true
  }

  const handleSwap = async () => {
    const valid = validateAmount()
    if (!valid) return
    try {
      setLoading(true)
      const addressFrom = selectedTokenFrom.address
      const addressTo = selectedTokenTo.address
      const rateFrom = await getRate(addressFrom)
      const rateTo = await getRate(addressTo)
      if (rateFrom <= 0 || rateTo <= 0) return

      const weiAmount = ethers.parseUnits(amount.toString(), selectedTokenFrom.decimals)

      await approveToken(addressFrom, weiAmount)
      await swapToken(addressFrom, addressTo, weiAmount)
      setAmount(0)
      setLoading(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='grid grid-cols-2 mb-4'>
        <div>
          <div className='mb-2'>Please select token you have</div>
          <select
            className='w-40 mb-4'
            value={selectedTokenFrom?.address || 'default'}
            onChange={(e) => handleSelectFrom(e.target.value)}
          >
            <option disabled value='default' className='hidden'>
              {' '}
              -- select a token --{' '}
            </option>
            {tokensInfo.map((token) => {
              return (
                <option key={token.address} value={token.address} disabled={token.address === selectedTokenTo?.address}>
                  {token.symbol}
                </option>
              )
            })}
          </select>
          {selectedTokenFrom && (
            <div className='flex flex-col gap-1'>
              <div>{`Selected: ${selectedTokenFrom.symbol} (${selectedTokenFrom.address})`}</div>
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
            </div>
          )}
        </div>
        <div>
          <div className='mb-2'>Please select token you want</div>
          <select
            className='w-40 mb-4'
            value={selectedTokenTo?.address || 'default'}
            onChange={(e) => handleSelectTo(e.target.value)}
          >
            <option disabled value='default' className='hidden'>
              {' '}
              -- select a token --{' '}
            </option>
            {tokensInfo.map((token) => {
              return (
                <option
                  key={token.address}
                  value={token.address}
                  disabled={token.address === selectedTokenFrom?.address}
                >
                  {token.symbol}
                </option>
              )
            })}
          </select>
          {selectedTokenTo && (
            <div className='flex flex-col gap-1'>
              <div>{`Selected: ${selectedTokenTo.symbol} (${selectedTokenTo.address})`}</div>
              {selectedTokenFrom?.rate && (
                <div>Estimated amount you will receive: {amount * (selectedTokenTo.rate / selectedTokenFrom.rate)}</div>
              )}
            </div>
          )}
        </div>
      </div>
      {selectedTokenFrom && selectedTokenTo && (
        <div className='items-center flex flex-col gap-2'>
          {errorMsg && <div className='text-red-600'>{errorMsg}</div>}
          <button
            className={`w-20 border border-black rounded bg-gray-100 ${loading && 'cursor-progress'}`}
            disabled={loading || !selectedTokenFrom || !selectedTokenTo}
            onClick={handleSwap}
          >
            {loading ? 'Loading...' : 'Swap'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Swap
