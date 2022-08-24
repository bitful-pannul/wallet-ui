import React from 'react'
import Row from '../spacing/Row'
import Link from './Link'
// import logoWithText from '../../assets/img/uqbar-logo-text.png'
import logo from '../../assets/img/logo192.png'
import { isMobileCheck } from '../../utils/dimensions'
import useWalletStore from '../../store/walletStore'
import { FaWallet, FaKey, FaHistory } from 'react-icons/fa'
import { PUBLIC_URL } from '../../utils/constants'
import './Navbar.scss'

const Navbar = () => {
  const isMobile = isMobileCheck()
  const { selectedTown, setNode } = useWalletStore()

  const selectTown = (town: number, setOpen: Function) => () => {
    setNode(town, '~zod')
    setOpen(false)
  }

  return (
    <Row className='navbar'>
      <Row>
        <div className="nav-link logo">
          <img src={logo} alt="Uqbar Logo" />
        </div>
        <Link className={`nav-link ${window.location.pathname === `${PUBLIC_URL}/` || window.location.pathname === PUBLIC_URL ? 'selected' : ''}`} href="/">
          {isMobile ? <FaWallet  /> : 'Assets'}
        </Link>
        <Link className={`nav-link ${window.location.pathname.includes('/accounts') ? 'selected' : ''}`} href="/accounts">
          {isMobile ? <FaKey  /> : 'Accounts'}
        </Link>
        <Link className={`nav-link ${window.location.pathname.includes('/transactions') ? 'selected' : ''}`} href="/transactions">
          {isMobile ? <FaHistory  /> : 'History'}
        </Link>
      </Row>
    </Row>
  )
}

export default Navbar
