import { useContext, useState, useRef, useEffect } from "react";
// import { useLogin } from "../hooks/useLogin";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import BookingsContext from "../context/BookingsContext";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const { getLoggedIn } = useContext(AuthContext);
  const { fetchAdminBookings } = useContext(BookingsContext);
  const inputRef = useRef(null);

  // const {login, error, isLoading} = useLogin()
  useEffect(() => {
    inputRef.current.select();
  }, []);

  const adminLogin = async (e) => {
    e.preventDefault();
    if (password.length < 10) {
      return;
    }

    try {
      const response = await axios.post(
        "https://ramsaysdetailing.ca:4000/auth/admin",
        {
          password,
        },
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        await fetchAdminBookings();
        await getLoggedIn();
      }
    } catch (error) {
      console.log("Error logging in as admin: " + error);
    }
  };

  return (
    <div className="flex h-screen flex-col justify-center bg-secondary-0">
      <div className="mx-auto flex flex-col items-center justify-center rounded-3xl bg-primary-0 px-5 pb-5 shadow-2xl">
        <h3 className="m-10 flex justify-center text-3xl">
          <b>Admin Login</b>
        </h3>

        <form
          onSubmit={adminLogin}
          className="flex flex-col sm:flex-row sm:items-center sm:gap-3"
        >
          <label className="text-lg font-bold">Password:</label>
          <input
            type="password"
            ref={inputRef}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="mt-1 h-10 rounded-md border border-gray-300 px-4 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-0"
          />
          <button
            onClick={adminLogin}
            className="button mt-5 bg-ramsayBlue-0 text-white sm:mt-0"
          >
            Log In As Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
