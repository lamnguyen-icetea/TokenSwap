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

  const handleSelectFrom = (token: string) => {
    const selected = tokensInfo.find((item) => item.address === token)
    setAmount(0)
    setSelectedTokenFrom(selected)
  }

  const handleSelectTo = (token: string) => {
    const selected = tokensInfo.find((item) => item.address === token)
    setSelectedTokenTo(selected)
  }

  const handleSwap = async () => {
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
      setLoading(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='grid grid-cols-2'>
        <div>
          <div>Please select token you have</div>
          <select
            className='w-40'
            value={selectedTokenFrom?.address || 'default'}
            onChange={(e) => handleSelectFrom(e.target.value)}
          >
            <option disabled selected value='default' className='hidden'>
              {' '}
              -- select a token --{' '}
            </option>
            {tokensInfo.map((token) => {
              return (
                <option value={token.address} disabled={token.address === selectedTokenTo?.address}>
                  {token.symbol}
                </option>
              )
            })}
          </select>
          {selectedTokenFrom && (
            <div>
              <div>{selectedTokenFrom.symbol}</div>
              <label>Amount:</label>
              <input
                disabled={loading}
                type='number'
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.valueAsNumber)}
              />
            </div>
          )}
        </div>
        <div>
          <div>Please select token you want</div>
          <select
            className='w-40'
            value={selectedTokenTo?.address || 'default'}
            onChange={(e) => handleSelectTo(e.target.value)}
          >
            <option disabled selected value='default' className='hidden'>
              {' '}
              -- select a token --{' '}
            </option>
            {tokensInfo.map((token) => {
              return (
                <option value={token.address} disabled={token.address === selectedTokenFrom?.address}>
                  {token.symbol}
                </option>
              )
            })}
          </select>
          {selectedTokenTo && (
            <div>
              <div>{selectedTokenTo.symbol}</div>
              <div>Estimated amount you will receive: {amount * (selectedTokenTo.rate / selectedTokenFrom.rate)}</div>
            </div>
          )}
        </div>
      </div>
      <button disabled={loading || !selectedTokenFrom || !selectedTokenTo} onClick={handleSwap}>
        Swap
      </button>
    </div>
  )
}

export default Swap
