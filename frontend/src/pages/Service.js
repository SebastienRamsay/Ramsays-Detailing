import { useServicesContext } from "../hooks/useServicesContext"
import { useParams } from 'react-router-dom';

import FullServiceDetails from "../components/fullServiceDetails"

const Services = () => {

    const { services } = useServicesContext()
    const { serviceName } = useParams()

    
    return (
        <div className="services">
            {services && services.map(service => (
                service.title.replace(/\s+/g, '') === serviceName ? 
                    <FullServiceDetails key={service.id} service={service}></FullServiceDetails>
                : null
            ))}
        </div>
    )
}
export default Services