import { useContext } from "react";

import { Link } from "react-router-dom";
import ServiceDetails from "../components/ServiceDetails";
import ServicesContext from "../context/ServicesContext";

const Services = () => {
  const { services } = useContext(ServicesContext);

  return (
    <div className="mx-10 flex flex-col justify-center gap-10 pt-20 md:flex-row">
      {services &&
        services.map((service) => (
          <Link
            to={`/service/${service.title.replace(/\s+/g, "")}`}
            key={service._id}
          >
            <ServiceDetails service={service} />
          </Link>
        ))}
    </div>
  );
};
export default Services;
