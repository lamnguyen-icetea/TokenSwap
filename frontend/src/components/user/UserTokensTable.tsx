import { ISwapTokenInfoWithAddr } from '../../types'

interface IProps {
  tokensInfo: ISwapTokenInfoWithAddr[]
}

const UserTokensTable = ({ tokensInfo }: IProps) => {
  return (
    <table className='w-full border-collapse'>
      <thead>
        <tr>
          <td className='py-2 px-4 font-bold text-base text-left border border-black bg-white'>Address</td>
          <td className='py-2 px-4 font-bold text-base text-left border border-black bg-white'>Symbol</td>
          <td className='py-2 px-4 font-bold text-base text-left border border-black bg-white'>Rate (to ETH)</td>
        </tr>
      </thead>
      <tbody>
        {tokensInfo.map((data) => {
          return (
            <tr>
              <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>{data.address}</td>
              <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>{data.symbol}</td>
              <td className='py-2 px-4 text-sm text-left border border-black bg-gray-100'>{data.rate}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default UserTokensTable
