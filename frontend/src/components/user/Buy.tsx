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

  const handleSelect = (token: string) => {
    const selected = tokensInfo.find((item) => item.address === token)
    setAmount(0)
    setSelectedToken(selected)
  }

  const handleBuy = async () => {
    try {
      setLoading(true)
      const rate = await getRate(selectedToken.address)
      if (rate <= 0) return

      const weiValue = ethers.parseEther((amount / rate).toString())

      await buyToken(selectedToken.address, weiValue)
      setLoading(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  return (
    <div>
      <div>Please select token you want to buy</div>
      <select
        className='w-40'
        value={selectedToken?.address || 'default'}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option disabled selected value='default' className='hidden'>
          {' '}
          -- select a token --{' '}
        </option>
        {tokensInfo.map((token) => {
          return <option value={token.address}>{token.symbol}</option>
        })}
      </select>
      {selectedToken && (
        <div>
          <div>{selectedToken.symbol}</div>
          <label>Amount:</label>
          <input
            disabled={loading}
            type='number'
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.valueAsNumber)}
          />
          <div>Estimated cost (exchange rates may vary): {amount / selectedToken.rate} ETH</div>
          <button disabled={loading} onClick={handleBuy}>
            Buy
          </button>
        </div>
      )}
    </div>
  )
}

export default Buy
