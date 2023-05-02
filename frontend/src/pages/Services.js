import { useEffect } from "react"

import ServiceDetails from "../components/ServiceDetails"
import { Link } from "react-router-dom"
import { useServicesContext } from "../hooks/useServicesContext"

const Services = () => {

    const { services, dispatch } = useServicesContext()
    

    useEffect(() => {

        const fetchServices = async () => {
            const response = await fetch('/api/services')
            const json = await response.json()
            if (response.ok){
                dispatch({type: 'SET_SERVICES', payload: json})
            }
        }

        fetchServices()
    }, [dispatch]) // add an empty dependency array to run the effect only once on mount
    if (!services){
        return (
            <div className="services">
                <h4>Loading...</h4>
            </div>
        )
    }
    return (
        <div className="services">
            {services && services.map(service => (
                <Link to={`/service/${service.title.replace(/\s+/g, '')}`} key={service._id}>
                    <ServiceDetails service={service}/>
                </Link>
            ))}
        </div>
    )
}
export default Services