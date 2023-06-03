import { Link } from 'react-router-dom'
import LogOutBtn from './LogOutBtn'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const Navbar = () => {

  const { loggedIn } = useContext(AuthContext)

  return (
    <header>
      <div className="container">
        <Link to="/">
          <h1>Workout Buddy</h1>
        </Link>
        <nav>
          {loggedIn && (
          <div>
            <LogOutBtn/>
          </div>
          )}
          {!loggedIn && (
          <div>
            <Link to="/login">Login</Link>
          </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar