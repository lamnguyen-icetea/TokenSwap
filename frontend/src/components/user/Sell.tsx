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

  const handleSelect = (token: string) => {
    const selected = tokensInfo.find((item) => item.address === token)
    setAmount(0)
    setSelectedToken(selected)
  }

  const handleSell = async () => {
    try {
      setLoading(true)
      const address = selectedToken.address
      const rate = await getRate(address)
      if (rate <= 0) return

      const weiAmount = ethers.parseUnits(amount.toString(), selectedToken.decimals)

      await approveToken(address, weiAmount)
      await sellToken(address, weiAmount)
      setLoading(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  return (
    <div>
      <div>Please select token you want to sell</div>
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
          <div>Estimated receiving ETH (exchange rates may vary): {amount / selectedToken.rate} ETH</div>
          <button disabled={loading} onClick={handleSell}>
            Sell
          </button>
        </div>
      )}
    </div>
  )
}

export default Sell
