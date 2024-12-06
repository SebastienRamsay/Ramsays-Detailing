import { useEffect, useState } from "react"

import ServiceDetails from "../components/ServiceDetails"
import { Link } from "react-router-dom"


const Services = () => {

    const [ services, setServices ] = useState(null)
    

    useEffect(() => {
        const fetchServices = async () => {
            const response = await fetch('https://ramsays-detailing.onrender.com/api/services', {
                method: 'GET',
                credentials: 'include'
            })
            const json = await response.json()

            if (response.ok){
                setServices(json)
            }
        }

        fetchServices()
    }, []) // add an empty dependency array to run the effect only once on mount
    return (
        <div class="flex justify-center gap-10">
            {services && services.map(service => (
                <Link to={`/service/${service.title.replace(/\s+/g, '')}`} key={service._id}>
                    <ServiceDetails service={service}/>
                </Link>
            ))}
        </div>
    )
}
export default Services