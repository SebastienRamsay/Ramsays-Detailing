import { useState } from "react";
// import { useLogin } from "../hooks/useLogin";
import { Link } from "react-router-dom";

const Login = () =>{
    const [name, setName] = useState('')
    // const {login, error, isLoading} = useLogin()

    const handleSubmit = async (e) => {
        e.preventDefault()
    }

    return (
        <div class="bg-white flex flex-col items-center justify-center max-w-md mx-auto rounded-3xl pb-5 shadow-2xl">
            <form onSubmit={handleSubmit}>
                <h3 class="flex justify-center text-2xl font-bold m-10">Login</h3>

                <label class="font-bold text-lg">Name</label>
                <input
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    class="ml-2 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button onClick={handleSubmit} class="bg-gray-400 ml-2 button">Log In As Guest</button>
                
                {/* {error && <div className="error">{error}</div>} */}
            </form>
            <p class="p-5 font-bold text-xl">or</p>
            <Link to="https://ramsays-detailing.onrender.com/auth/google">
                <button class="bg-blue-600 flex items-center">
                    <img src='https://ramsays-detailing.onrender.com/images/google.png' alt="google" class="h-auto w-10 p-1"/>
                    <span class="mx-2 text-gray-50">Sign in with Google</span>
                </button>
            </Link>
            <p class="pt-2">Allows Calender Use</p>
        </div>
        
    )
}

export default Login