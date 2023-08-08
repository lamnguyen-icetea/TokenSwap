import { maskAddress } from '../../utils'

interface IProps {
  accounts: string[]
  isAdmin: boolean
}

const Header = ({ accounts, isAdmin }: IProps) => {
  return (
    <div className='bg-white sticky top-0 z-50 px-16 py-4 flex justify-between items-center border-b-2 border-solid border-black'>
      <div className='text-2xl font-bold'>Token Swap</div>
      <div>
        {isAdmin ? 'Admin' : 'User'}: {maskAddress(accounts[0])}
      </div>
    </div>
  )
}

export default Header
