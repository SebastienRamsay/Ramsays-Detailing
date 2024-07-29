import axios from "axios";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

function AuthContextProvider(props) {
  const [loggedIn, setLoggedIn] = useState();
  const [coords, setCoords] = useState([]);
  const [isAdmin, setIsAdmin] = useState();
  const [isEmployee, setIsEmployee] = useState();
  const [adminInfo, setEmployeeInfo] = useState();
  const [adminUserInfo, setAdminUserInfo] = useState();
  const [displayName, setDisplayname] = useState();
  const [profilePicture, setProfilePicture] = useState();
  const isMounted = useRef(false);

  const connectStripeAccount = async () => {
    try {
      const response = await axios.post(
        "https://ramsaysdetailing.ca:4000/api/stripe/connectStripeAccount",
        {},
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        if (response.data.url) {
          return response.data.url;
        } else {
          toast.success(response.data);
        }
      } else {
        toast.error("Error Creating Creating Account");
      }
    } catch (error) {
      console.log("Error requesting to update employee info: " + error);
    }
  };

  const deleteStripeAccount = async () => {
    try {
      const response = await axios.delete(
        "https://ramsaysdetailing.ca:4000/api/stripe/deleteStripeAccount",
        {},
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success(response.data);
      } else {
        toast.error("Error Deleting Stipe Account");
      }
    } catch (error) {
      console.log("Error Deleting Stipe Account: " + error);
    }
  };

  async function updateEmployeeInfo(location, services, distance, userId) {
    if (location.length < 10) {
      return;
    }

    try {
      const response = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/user/employee/info",
        {
          location,
          services,
          distance,
          userId,
        },
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Error Updating employee info: " + error);
    }
  }

  const requestUpdateEmployeeInfo = async (
    address,
    availableServices,
    distance
  ) => {
    if (address.length < 10) {
      return;
    }

    try {
      const response = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/user/employee/info/request",
        {
          location: address,
          services: availableServices,
          distance,
        },
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Info Updated");
      }
      return response;
    } catch (error) {
      console.log("Error requesting to update employee info: " + error);
    }
  };

  async function getUserInfo() {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/user/info",
        {},
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
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
          headers: {
            "Content-Type": "application/json",
          },
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
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        console.log(response.data);
        setCoords(response.data.adminInfo.coords);
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
        requestUpdateEmployeeInfo,
        updateEmployeeInfo,
        coords,
        deleteStripeAccount,
        connectStripeAccount,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

export { AuthContextProvider };
