import { useParams } from 'react-router-dom';

import FullServiceDetails from "../components/fullServiceDetails"
import { useContext } from "react";
import ServicesContext from '../context/ServicesContext';

const Service = () => {

    const { services } = useContext(ServicesContext)
    const { serviceName } = useParams()

    return (
        <div className="services">
            {services && services.map(service => (
                service.title.replace(/\s+/g, '') === serviceName ? 
                    <FullServiceDetails key={service.title} service={service}></FullServiceDetails>
                : null
            ))}
        </div>
    )
}
export default Service