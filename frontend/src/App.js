import axios from "axios";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// pages & components
import { useContext } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthContext from "./context/AuthContext";
import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminUserInfo from "./pages/AdminUserInfo";
import Bookings from "./pages/Bookings";
import Cart from "./pages/Cart";
import EmployeeInfo from "./pages/EmployeeInfo";
import Home from "./pages/Home";
import Service from "./pages/Service";
import Services from "./pages/Services";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/privacyPolicy";

axios.defaults.withCredentials = true;

function App() {
  const { loggedIn, isAdmin, isEmployee } = useContext(AuthContext);

  return (
    <div className="app">
      {loggedIn !== undefined ? (
        <BrowserRouter>
          <Navbar />
          <div className="page min-h-screen bg-secondary-0 font-body font-semibold italic text-white">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/adminLogin"
                element={isAdmin || !loggedIn ? <Home /> : <AdminLogin />}
              />
              <Route
                path="/employee"
                element={!isEmployee ? <Home /> : <EmployeeInfo />}
              />
              <Route
                path="/admin"
                element={!isAdmin ? <Home /> : <AdminUserInfo />}
              />
              <Route path="/services" element={<Services />} />
              <Route
                path="/bookings"
                element={!loggedIn ? <Home /> : <Bookings />}
              />
              <Route path="/service/:serviceName" element={<Service />} />
              <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cart" element={!loggedIn ? <Home /> : <Cart />} />
            </Routes>
          </div>
          <Footer />
        </BrowserRouter>
      ) : (
        <div className="page flex min-h-screen items-center justify-center space-x-2 bg-secondary-0">
          <div className="h-4 w-4 animate-pulse rounded-full dark:bg-white"></div>
          <div className="h-4 w-4 animate-pulse rounded-full dark:bg-white"></div>
          <div className="h-4 w-4 animate-pulse rounded-full dark:bg-white"></div>
        </div>
      )}
    </div>
  );
}

export default App;
