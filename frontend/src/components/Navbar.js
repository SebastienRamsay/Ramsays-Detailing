import { Link, useLocation } from 'react-router-dom'
import LogOutBtn from './LogOutBtn'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const Navbar = () => {

  const { loggedIn } = useContext(AuthContext)
  const location = useLocation()
  const isLoginPage = location.pathname === '/login';

  return (
    <header class="text-white">
      <div class="bg-primary-0 pt-5 pl-10 pr-20 pb-2">
        <Link to="/" class="flex-col">
          <img class="h-auto w-64" src="img/LOGO.png" alt="logo"/>
          <h1 class="title">Ramsay's Detailing</h1>
        </Link>
        <nav class="">
          {loggedIn && (
          <div>
            <div class="flex justify-center font-semibold">
              <a href='http://localhost:3000'>
                <button class="hover:font-bold">Home</button>
              </a>
              <a href='http://localhost:3000/services'>
                <button class="hover:font-bold ml-10">Services</button>
              </a>
              <a href='http://localhost:3000/about'>
                <button class="ml-10 hover:font-bold">About</button>
              </a>
            </div>
            <div class="absolute end-0 right-16 top-11 bg-red-700 button">
              <LogOutBtn/>
            </div>   
            <div>
              <Link to="/cart">Cart</Link>
            </div>
          </div>
          )}
          {!loggedIn && !isLoginPage && (
          <div class="absolute end-0 right-16 top-11 bg-green-700 button">
            <Link to="/login">Login</Link>
          </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar