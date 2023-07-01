import { useEffect } from "react"
import { useUsersContext } from "../hooks/useAuthContext"

// components
import UserForm from "../components/UserForm"

const LoginOrRegister = () => {
    
    const { dispatch } = useUsersContext()

    useEffect(() => {
    const fetchUsers = async () => {
        const response = await fetch('https://ramsays-detailing.onrender.com/api/users')
        const json = await response.json()

        if (response.ok) {
        dispatch({type: 'SET_WORKOUTS', payload: json})
        }
    }

    fetchUsers()
    }, [dispatch])
    
  
    return (
      <div className="loginorregister">
        <div className="login">
            <UserForm/>
        </div>
      </div>
    )
}
  
  export default LoginOrRegister