import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function LogOutBtn() {
    const { getLoggedIn } = useContext(AuthContext)

    async function logout() {
        await fetch('https://ramsays-detailing.onrender.com/logout', {
            method: 'GET',
            credentials: 'include'
        })
        getLoggedIn()
    }

    return <button onClick={logout}>Log Out</button>
}

export default LogOutBtn