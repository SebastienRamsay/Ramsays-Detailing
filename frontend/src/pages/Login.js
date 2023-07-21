import { useContext, useState } from "react";
// import { useLogin } from "../hooks/useLogin";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Login = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState();
  const { getLoggedIn } = useContext(AuthContext);
  // const {login, error, isLoading} = useLogin()

  const guestLogin = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Please provide a name");
      return;
    }
    setError();
    const response = await axios.post(
      "http://45.74.32.213:4000/guest",
      {
        name,
      },
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status !== 200) {
      setError("error loging in as guest");
      console.log("error loging in as guest: " + response);
    } else {
      setError(response.message);
      getLoggedIn();
    }
  };

  return (
    <div className="flex h-screen flex-col justify-center bg-secondary-0">
      <div className="mx-auto flex flex-col items-center justify-center rounded-3xl bg-primary-0 px-5 pb-5 shadow-2xl">
        <h3 className="m-10 flex justify-center text-3xl">
          <b>Login</b>
        </h3>

        <form
          onSubmit={guestLogin}
          className="flex flex-col sm:flex-row sm:items-center sm:gap-3"
        >
          <label className="text-lg font-bold">Name:</label>
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="mt-1 h-10 rounded-md border border-gray-300 px-4 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-0"
          />
          <button
            onClick={guestLogin}
            className="button mt-5 bg-ramsayBlue-0 text-white sm:mt-0"
          >
            Log In As Guest
          </button>
        </form>
        {error && (
          <div className="mt-2 text-lg text-red-500">
            <b>{error}</b>
          </div>
        )}
        <p className="p-5 text-xl font-bold">or</p>
        <Link to="http://45.74.32.213:4000/auth/google">
          <button className="flex items-center rounded-full bg-ramsayBlue-0 p-2 hover:bg-ramsayBlueHover-0">
            <img
              src="http://45.74.32.213:4000/images/google.png"
              alt="google"
              className="h-auto w-9 rounded-full sm:w-10"
            />
            <span className="text-bold mx-2 text-lg">Sign in with Google</span>
          </button>
        </Link>
        <p className="pt-2">Allows Calender Use</p>
      </div>
    </div>
  );
};

export default Login;
