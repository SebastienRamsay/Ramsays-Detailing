import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import axios from "axios"

// pages & components
import Home from './pages/Home'
import Login from './pages/Login'
import Services from './pages/Services'
import Service from './pages/Service'
import Navbar from './components/Navbar'
import AuthContext from './context/AuthContext'
import { useContext } from 'react'

axios.defaults.withCredentials = true

function App() {

  const { loggedIn } = useContext(AuthContext)

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route 
              path="/" 
              element={loggedIn ? <Home /> : <Navigate to="/login"/>} 
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
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;

