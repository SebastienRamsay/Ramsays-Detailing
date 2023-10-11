import axios from "axios";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const AuthContext = createContext();

function AuthContextProvider(props) {
  const [loggedIn, setLoggedIn] = useState();
  const [isAdmin, setIsAdmin] = useState();
  const [isEmployee, setIsEmployee] = useState();
  const [adminInfo, setEmployeeInfo] = useState();
  const [adminUserInfo, setAdminUserInfo] = useState();
  const [displayName, setDisplayname] = useState();
  const [profilePicture, setProfilePicture] = useState();
  const isMounted = useRef(false);

  async function getUserInfo() {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/user/info",
        {},
        {
          credentials: "include",
        }
      );
      if (response.status === 200) {
        const displayName = response.data.displayName;
        const profilePicture = response.data.profilePicture;
        console.log(displayName);
        setProfilePicture(profilePicture);
        setDisplayname(displayName);
      }
    } catch (error) {
      console.log("AuthContext Error: " + error);
    }
  }

  async function getAllUserInfo() {
    try {
      const userResponse = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/user/admin/info",
        {
          credentials: "include",
        }
      );
      if (userResponse.status === 200) {
        const data = await userResponse.data;
        const employees = data.employeeData;
        const users = data.userData;

        setAdminUserInfo({ employees, users });
      }
    } catch (error) {
      console.log("AuthContext Error: " + error);
    }
  }

  const getLoggedIn = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/LoggedIn",
        {},
        {
          credentials: "include",
        }
      );
      if (response.status === 200) {
        const loginType = response.data.loginType;
        if (loginType === "guest") {
          setIsAdmin(false);
          setIsEmployee(false);
          setLoggedIn(false);
        } else if (loginType === "admin") {
          setEmployeeInfo(response.data.adminInfo);
          setIsAdmin(true);
          setIsEmployee(false);
          setLoggedIn(true);
          getAllUserInfo();
          console.log("logged in as admin");
        } else if (loginType === "employee") {
          setEmployeeInfo(response.data.adminInfo);
          setIsAdmin(false);
          setIsEmployee(true);
          setLoggedIn(true);
          console.log("logged in as employee");
        } else if (loginType === "google") {
          setIsAdmin(false);
          setIsEmployee(false);
          setLoggedIn(true);
          console.log("logged in with google");
        }
      }
    } catch (error) {
      console.log("AuthContext Error: " + error);
    }
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      getLoggedIn();
    }

    if (loggedIn) {
      getUserInfo();
    }

    return () => {
      isMounted.current = true;
    };
  }, [isMounted, loggedIn, getLoggedIn]);

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminUserInfo,
        isEmployee,
        adminInfo,
        loggedIn,
        getLoggedIn,
        displayName,
        profilePicture,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

export { AuthContextProvider };
