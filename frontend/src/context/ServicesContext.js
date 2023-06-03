import React, { createContext, useEffect, useState } from "react"

const ServicesContext = createContext()

function ServicesContextProvider(props){
  const [services, setServices] = useState(undefined)

  async function getServices() { 
    const response = await fetch('http://localhost:4000/api/services', {
      method: 'GET',
      credentials: 'include'
    })
    var json = await response.json()
    setServices(json)
  }

  useEffect(() => {
    getServices()
  }, [])

  return <ServicesContext.Provider value={{services, getServices}}>
    {props.children}
  </ServicesContext.Provider>
}

export default ServicesContext

export { ServicesContextProvider }