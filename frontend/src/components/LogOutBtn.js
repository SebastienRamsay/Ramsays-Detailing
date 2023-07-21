import axios from "axios";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import CartContext from "../context/CartContext";

function LogOutBtn() {
  const { getLoggedIn } = useContext(AuthContext);
  const { clearStoredCart } = useContext(CartContext);

  async function logout() {
    await clearStoredCart();
    await axios.get("/logout", {
      credentials: "include",
    });
    getLoggedIn();
  }

  return <button onClick={logout}>Log Out</button>;
}

export default LogOutBtn;
