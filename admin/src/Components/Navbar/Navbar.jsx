import React from 'react';
import './Navbar.css';
import navlogo from '../../assets/nav-logo.png'      // Bring back the logo
import navProfile from '../../assets/nav-profile.png'

const Navbar = () => {
  return (
    <div className='navbar'>
        <div className="navbar-left">
          <img src={navlogo} alt="" className='navbar-logo' />
          <div className="navbar-text">
            <h1 className="navbar-title">SHOPDESHI</h1>
            <span className="navbar-subtitle">Admin Panel</span>
          </div>
        </div>
        <img src={navProfile} alt="" className='navbar-profile' />
    </div>
  )
}

export default Navbar;