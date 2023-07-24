import axios from "axios";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// pages & components
import { useContext, useEffect } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthContext from "./context/AuthContext";
import CartContext from "./context/CartContext";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Service from "./pages/Service";
import Services from "./pages/Services";

export const BACKEND = "https://ramsays-detailing.onrender.com";

axios.defaults.withCredentials = true;

function App() {
  const { loggedIn } = useContext(AuthContext);
  const { getCart } = useContext(CartContext);

  useEffect(() => {
    if (loggedIn) getCart();
  }, [loggedIn, getCart]);

  if (loggedIn === undefined) {
    return (
      <div className="app">
        <BrowserRouter>
          <div className="pages"></div>
          <Footer />
        </BrowserRouter>
      </div>
    );
  }

  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <div className="page min-h-screen bg-secondary-0 font-body font-semibold italic text-white">
          <Routes>
            <Route
              path="/"
              element={loggedIn ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/about"
              element={loggedIn ? <About /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!loggedIn ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/services"
              element={!loggedIn ? <Login /> : <Services />}
            />
            <Route
              path="/service/:serviceName"
              element={!loggedIn ? <Login /> : <Service />}
            />
            <Route path="/cart" element={!loggedIn ? <Login /> : <Cart />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
