
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import axios from "axios"

// pages & components
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Services from './pages/Services'
import Service from './pages/Service'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthContext from './context/AuthContext'
import { useContext, useEffect } from 'react'
import CartContext from './context/CartContext'

export const BACKEND = "https://ramsays-detailing.onrender.com"


axios.defaults.withCredentials = true

function App() {

  const { loggedIn } = useContext(AuthContext)
  const { getCart } = useContext(CartContext)

  useEffect(() => {
    if (loggedIn)(
      getCart()
    )
  }, [loggedIn, getCart])
  
  

  if (loggedIn === undefined){
    return (
      <div className="app">
      <BrowserRouter>
        
        <div className="pages">
          
        </div>
        <Footer/>
      </BrowserRouter>
    </div>
    
  );
  }

  return (
      <div>
      <BrowserRouter>
        <Navbar />
        <div className='min-h-screen font-body italic font-semibold bg-secondary-0 text-white'>
          <Routes>
            <Route 
              path="/" 
              element={loggedIn ? <Home /> : <Navigate to="/login"/>} 
            />
            <Route 
              path="/about" 
              element={loggedIn ? <About /> : <Navigate to="/login"/>} 
            />
            <Route 
              path="/login"
              element={!loggedIn ? <Login /> : <Navigate to="/"/>} 
            />
            <Route 
              path="/services"
              element={!loggedIn ? <Login /> : <Services/>} 
            />
            <Route 
              path="/service/:serviceName"
              element={!loggedIn ? <Login /> : <Service/>} 
            />
            <Route
              path='/cart'
              element={!loggedIn ? <Login /> : <Cart/>}
            />
          </Routes>
        </div>
        <Footer/>
      </BrowserRouter>
    </div>
    
  );
}

export default App;

