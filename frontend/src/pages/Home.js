import { useEffect } from "react"
import { Link } from 'react-router-dom'

const Home = () => {

  useEffect(() => {
    
    
    
  }, [])

  return (
    <div class="flex flex-col items-center">
      <h1 class="text-6xl mb-8"><b>WELCOME</b></h1>
      <p class="text-center">
        Welcome to our <b>mobile detailing service</b>, 
        where we offer top <b>quality services at unbeatable prices</b>.<br/> 
        Call us anytime to get a free quote on a detailing.
      </p>
      <div class="mb-8">
        <a href="tel:+16137692098" class="flex items-center">
          <strong class="text-2xl font-sans">613-769-2098</strong>
          <img alt="phone" src='https://ramsays-detailing.onrender.com/images/phone.png' class="max-h-6 ml-3"/>
        </a>
      </div>
      <Link to='/services' class="border rounded-full py-2 px-10 text-lg hover:font-bold hover:border-2">
        Services
      </Link>
    </div>
  )
}

export default Home