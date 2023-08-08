import { useState } from 'react'

interface IProps {
  setToken: (token: string, rate: number) => Promise<void>
  tokensList: string[]
}

const AddToken = ({ setToken, tokensList }: IProps) => {
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [address, setAddress] = useState<string>('')
  const [rate, setRate] = useState<number>()
  const [addressError, setAddressError] = useState<string>('')
  const [rateError, setRateError] = useState<string>('')

  const validateInput = () => {
    if (address.trim() !== '' && Number.isInteger(rate) && rate >= 1 && !tokensList.includes(address.trim())) {
      setAddressError('')
      setRateError('')
      return true
    } else {
      if (address.trim() === '') {
        setAddressError('Address is required!')
      } else if (tokensList.includes(address.trim())) {
        setAddressError('Already added this address!')
      } else {
        setAddressError('')
      }

      if (!Number.isInteger(rate) || rate < 1) {
        setRateError('Rate must be an integer and greater than 1!')
      } else {
        setRateError('')
      }
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = validateInput()
    if (!isValid) return

    try {
      setLoading(true)
      await setToken(address, rate)
      setLoading(false)
      setAddress('')
      setRate(null)
      setAddressError('')
      setRateError('')
      setIsAdding(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  return (
    <div className='w-full flex justify-center items-center'>
      {isAdding ? (
        <form className='w-full flex flex-col gap-4 justify-center items-center' onSubmit={(e) => handleSubmit(e)}>
          <div className='w-full grid grid-cols-2'>
            <div className='flex flex-col px-4'>
              <label>Token address:</label>
              <input
                className='px-2'
                type='text'
                value={address}
                placeholder='Ex: 0x...'
                onChange={(e) => setAddress(e.target.value)}
              />
              {addressError && <div className='text-red-600'>{addressError}</div>}
            </div>
            <div className='flex flex-col px-4'>
              <label>Rate to ETH:</label>
              <input
                className='px-2'
                type='number'
                value={rate}
                placeholder='Ex: 10000'
                onChange={(e) => setRate(e.target.valueAsNumber)}
              />
              {rateError && <div className='text-red-600'>{rateError}</div>}
            </div>
          </div>
          <button type='submit' disabled={loading}>
            Submit
          </button>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)}>Add Token</button>
      )}
    </div>
  )
}

export default AddToken
