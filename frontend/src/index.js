import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ServicesContextProvider } from './context/ServicesContext';
import { AuthContextProvider } from './context/AuthContext';
import { CartContextProvider } from './context/CartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ServicesContextProvider>
      <AuthContextProvider>
        <CartContextProvider>
          <App />
        </CartContextProvider>
      </AuthContextProvider>
    </ServicesContextProvider>
  </React.StrictMode>
)