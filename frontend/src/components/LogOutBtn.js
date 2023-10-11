import axios from "axios";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function LogOutBtn() {
  const { getLoggedIn } = useContext(AuthContext);

  async function logout() {
    await axios.get("https://ramsaysdetailing.ca:4000/logout", {
      credentials: "include",
    });
    getLoggedIn();
  }

  return <button onClick={logout}>Log Out</button>;
}

export default LogOutBtn;
