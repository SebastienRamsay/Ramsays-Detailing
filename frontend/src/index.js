import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import { BookingsContextProvider } from "./context/BookingsContext";
import { CartContextProvider } from "./context/CartContext";
import { ServicesContextProvider } from "./context/ServicesContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ServicesContextProvider>
      <AuthContextProvider>
        <CartContextProvider>
          <BookingsContextProvider>
            <App />
          </BookingsContextProvider>
        </CartContextProvider>
      </AuthContextProvider>
    </ServicesContextProvider>
  </React.StrictMode>
);
