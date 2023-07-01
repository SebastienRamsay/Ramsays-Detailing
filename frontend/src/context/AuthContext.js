import React, { createContext, useEffect, useState } from "react"

const AuthContext = createContext()

function AuthContextProvider(props){
  const [loggedIn, setLoggedIn] = useState(undefined)
  const [cartLength, setCartLength] = useState(0)

  async function getLoggedIn() { 
    const loggedInRes = await fetch('https://ramsays-detailing.onrender.com/LoggedIn', {
      method: 'GET',
      credentials: 'include'
    })
    var data = await loggedInRes.json()
    setLoggedIn(data)
  }

  async function getCartLength() { 
    const cartResponse = await fetch('https://ramsays-detailing.onrender.com/api/cart', {
      method: 'GET',
      credentials: 'include'
    })
    var json = await cartResponse.json()
    setCartLength(json.services.length)
  }

  useEffect(() => {
    getLoggedIn()
    getCartLength()
  }, [])

  return <AuthContext.Provider value={{loggedIn, getCartLength, cartLength, getLoggedIn}}>
    {props.children}
  </AuthContext.Provider>
}

export default AuthContext

export { AuthContextProvider }