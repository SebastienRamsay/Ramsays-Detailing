import { useState } from "react";
// import { useLogin } from "../hooks/useLogin";
import { Link } from 'react-router-dom'

const Login = () =>{
    const [name, setName] = useState('')
    const [guest, setGuest] = useState(true)
    // const {login, error, isLoading} = useLogin()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (guest){

        }else{
            
        }
    }

    return (
        <div>
            <form className="login" onSubmit={handleSubmit}>
            <h3>Log in</h3>

            <label>Name:</label>
            <input
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
            />
            <button onClick={handleSubmit}>Log In As Guest</button>
            
            {/* {error && <div className="error">{error}</div>} */}
        </form>
        <p>or</p>
            <Link to="http://localhost:4000/auth/google">
                <button onClick={() => setGuest(false)}>
                    <span>Sign in with Google</span>
                </button>
            </Link>
            <p>Allows Calender Use</p>
        </div>
        
    )
}

export default Login