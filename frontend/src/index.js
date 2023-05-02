import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WorkoutsContextProvider } from './context/WorkoutsContext';
import { ServicesContextProvider } from './context/ServicesContext';
import { AuthContextProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ServicesContextProvider>
      <WorkoutsContextProvider>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </WorkoutsContextProvider>
    </ServicesContextProvider>
  </React.StrictMode>
)