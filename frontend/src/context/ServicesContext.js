import { createContext, useReducer } from 'react'

export const ServicesContext = createContext()

export const servicesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SERVICES':
      return { 
        services: action.payload 
      }
    case 'CREATE_SERVICE':
      return { 
        services: [action.payload, ...state.services] 
      }
    case 'DELETE_SERVICE':
      return { 
        services: state.services.filter(w => w._id !== action.payload._id) 
      }
    default:
      return state
  }
}

export const ServicesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(servicesReducer, { 
    services: null
  })
  
  return (
    <ServicesContext.Provider value={{ ...state, dispatch }}>
      { children }
    </ServicesContext.Provider>
  )
}