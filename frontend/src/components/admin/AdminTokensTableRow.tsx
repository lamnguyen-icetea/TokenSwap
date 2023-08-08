import { useState } from 'react'
import { ISwapTokenInfoWithAddr } from '../../types'

interface IProps {
  data: ISwapTokenInfoWithAddr
  removeToken: (token: string) => Promise<void>
  setToken: (token: string, rate: number) => Promise<void>
}

const AdminTokensTableRow = ({ data, removeToken, setToken }: IProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [rate, setRate] = useState<number>(data.rate)
  const [rateError, setRateError] = useState<string>('')

  const validateRate = () => {
    if (!Number.isInteger(rate) || rate < 1) {
      setRateError('Rate must be an integer and greater than 1!')
      return false
    }

    if (rate === data.rate) {
      setRateError('New rate must be different.')
      return false
    }

    if (Number.isInteger(rate) && rate >= 1 && rate !== data.rate) {
      setRateError('')
      return true
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      setIsEditing(false)
      await removeToken(data.address)
      setLoading(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const isValid = validateRate()
    if (!isValid) return

    try {
      setLoading(true)
      await setToken(data.address, rate)
      setIsEditing(false)
      setLoading(false)
    } catch (error) {
      console.debug(error)
      setLoading(false)
    }
  }

  return (
    <>
      {isEditing ? (
        <tr>
          <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>{data.address}</td>
          <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>{data.symbol}</td>
          <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>
            <input disabled={loading} type='number' value={rate} onChange={(e) => setRate(e.target.valueAsNumber)} />
            {rateError && <div className='text-red-600'>{rateError}</div>}
          </td>
          <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>
            <div className='flex justify-between'>
              <button disabled={loading} onClick={handleSave}>
                Save
              </button>
              <button disabled={loading} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </td>
        </tr>
      ) : (
        <tr>
          <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>{data.address}</td>
          <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>{data.symbol}</td>
          <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>{data.rate}</td>
          <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>
            <div className='flex justify-between'>
              <button disabled={loading} onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button disabled={loading} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default AdminTokensTableRow
