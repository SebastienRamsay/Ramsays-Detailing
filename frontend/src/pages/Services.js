import { useContext } from "react";

import { Link } from "react-router-dom";
import ServiceDetails from "../components/ServiceDetails";
import ServicesContext from "../context/ServicesContext";
import AuthContext from "../context/AuthContext";

const Services = () => {
  const { services } = useContext(ServicesContext);
  const { isAdmin } = useContext(AuthContext);

  return (
    <div className="mx-10 flex flex-col items-center justify-center gap-10 py-10 md:flex-row">
      {services &&
        services.map((service) => (
          <Link
            to={`/service/${service.title.replace(/\s+/g, "")}`}
            key={service._id}
          >
            <ServiceDetails service={service} />
          </Link>
        ))}
      {isAdmin ? (
        <Link
          to={`/service/${"new service".replace(/\s+/g, "")}`}
          key={0}
          className="my-auto max-w-md items-center justify-center rounded-xl bg-primary-0 p-20 text-6xl transition-all duration-300 hover:bg-white hover:text-black"
        >
          +
        </Link>
      ) : null}
    </div>
  );
};
export default Services;
