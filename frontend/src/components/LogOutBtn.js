import { useContext } from "react";
import AuthContext from "../context/AuthContext";


function LogOutBtn() {
    const { getLoggedIn } = useContext(AuthContext)

    async function logout() {
        await fetch('http://localhost:4000/logout', {
            method: 'GET',
            credentials: 'include'
        })
        getLoggedIn()
    }

    return <button onClick={logout}>Log Out</button>
}

export default LogOutBtn