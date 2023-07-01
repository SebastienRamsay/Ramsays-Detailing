import { Link, useLocation } from 'react-router-dom'
import LogOutBtn from './LogOutBtn'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const Navbar = () => {

  const { loggedIn, getCartLength, cartLength } = useContext(AuthContext)
  const location = useLocation()
  const isCartPage = location.pathname === '/cart';
  
  if (loggedIn){
    getCartLength()
  }
  

  return (
    <header class="text-white">
      <div class="bg-primary-0 pt-5 pl-10 pr-20 pb-2">
        <Link to="/" class="inline-block text-center">
          <img class="h-auto w-64" src='https://ramsays-detailing.onrender.com/images/LOGO.png' alt="logo"/>
          <h1 class="title">Ramsay's Detailing</h1>
        </Link>
        <nav class="">
          {loggedIn && (
          <div>
            <div class="flex justify-center font-semibold">
              <Link to="/">
                <button class="hover:font-bold">Home</button>
              </Link>
              <Link to='/services'>
                <button class="hover:font-bold ml-10">Services</button>
              </Link>
              <Link to='/about'>
                <button class="ml-10 hover:font-bold">About</button>
              </Link>
            </div>
            <span class="flex">
              <div class="absolute end-0 right-16 top-11 bg-red-700 button">
                <LogOutBtn/>
              </div> 
              {!isCartPage && (
                <div>
                  <Link to="/cart" class="absolute right-40 top-9 flex flex-col items-center">
                    <h1 class="absolute ml-1"><b>{cartLength}</b></h1>
                    <img alt="cart" src='/images/cart.png' class="max-h-11"/>
                  </Link>
                  <a href='https://www.instagram.com/ramsays_detailing/' target="_blank" rel="noreferrer" class="absolute right-56 top-12 mr-2">
                    <img src='https://ramsays-detailing.onrender.com/images/instagram.png' alt="instagram" class="max-h-6"/>
                  </a>
                  <a href='https://www.facebook.com/ramsaydetailing' target="_blank" rel="noreferrer" class="absolute right-64 top-10 mr-2">
                    <img src='https://ramsays-detailing.onrender.com/images/facebook.png' alt="facebook" class="max-h-10"/>
                  </a>
                  <a href="tel:+16137692098" class="absolute right-72 top-12 mr-6">
                    <img src='https://ramsays-detailing.onrender.com/images/phone.png' alt="phone" class="max-h-6"/>
                  </a>
                </div>
              )}  
              
            </span>
            
          </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar