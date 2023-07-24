import React, { createContext, useEffect, useRef, useState } from "react";

const AuthContext = createContext();

function AuthContextProvider(props) {
  const [loggedIn, setLoggedIn] = useState(undefined);
  const [isGuest, setIsGuest] = useState(undefined);
  const isMounted = useRef(false);

  async function getLoggedIn() {
    try {
      // const response = await axios.get(
      //   "http://45.74.32.213:4000/LoggedIn",
      //   {},
      //   {
      //     credentials: "include",
      //   }
      // );
      // if (response.status === 200) {
      //   var data = response.data;
      //   if (data !== "guest") {
      //     setIsGuest(false);
      //     setLoggedIn(data);
      //   } else {
      //     setIsGuest(true);
      //     console.log("logged in as guest");
      //     setLoggedIn(true);
      //   }
      // }
      setIsGuest(true);
      console.log("logged in as guest");
      setLoggedIn(true);
    } catch (error) {
      console.log("AuthContext Error: " + error);
    }
  }

  useEffect(() => {
    if (!isMounted.current) {
      getLoggedIn();
    }

    return () => {
      isMounted.current = true;
    };
  }, [isMounted]);

  return (
    <AuthContext.Provider value={{ isGuest, loggedIn, getLoggedIn }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

export { AuthContextProvider };
