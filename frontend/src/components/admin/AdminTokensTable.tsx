import { ISwapTokenInfoWithAddr } from '../../types'
import AdminTokensTableRow from './AdminTokensTableRow'

interface IProps {
  tokensInfo: ISwapTokenInfoWithAddr[]
  setToken: (token: string, rate: number) => Promise<void>
  removeToken: (token: string) => Promise<void>
}

const AdminTokensTable = ({ tokensInfo, setToken, removeToken }: IProps) => {
  return (
    <table className='w-full border-collapse'>
      <thead>
        <tr>
          <td className='py-2 px-4 font-bold text-base text-left border border-black bg-white'>Address</td>
          <td className='py-2 px-4 font-bold text-base text-left border border-black bg-white'>Symbol</td>
          <td className='py-2 px-4 font-bold text-base text-left border border-black bg-white'>Rate (to ETH)</td>
          <td className='py-2 px-4 font-bold text-base text-left border border-black bg-white'>Actions</td>
        </tr>
      </thead>
      <tbody>
        {tokensInfo.map((item) => {
          return <AdminTokensTableRow data={item} removeToken={removeToken} setToken={setToken} />
        })}
      </tbody>
    </table>
  )
}

export default AdminTokensTable
