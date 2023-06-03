import React, { createContext, useEffect, useState } from "react"

const AuthContext = createContext()

function AuthContextProvider(props){
  const [loggedIn, setLoggedIn] = useState(undefined)

  async function getLoggedIn() { 
    const loggedInRes = await fetch('http://localhost:4000/LoggedIn', {
      method: 'GET',
      credentials: 'include'
    })
    var data = await loggedInRes.json()
    setLoggedIn(data)
  }

  useEffect(() => {
    getLoggedIn()
  }, [])

  return <AuthContext.Provider value={{loggedIn, getLoggedIn}}>
    {props.children}
  </AuthContext.Provider>
}

export default AuthContext

export { AuthContextProvider }