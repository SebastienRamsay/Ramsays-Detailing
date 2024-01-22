import { useParams } from "react-router-dom";

import FullServiceDetails from "../components/fullServiceDetails";
import { useContext } from "react";
import ServicesContext from "../context/ServicesContext";

const Service = () => {
  const { services } = useContext(ServicesContext);
  const { serviceName } = useParams();

  return (
    <div className="services">
      {services &&
        services?.length > 0 &&
        services.map((service) =>
          service.title.replace(/\s+/g, "") === serviceName ? (
            <FullServiceDetails
              key={service.title}
              tempService={service}
            ></FullServiceDetails>
          ) : null
        )}
      {serviceName.replace(/\s+/g, "") === "newservice" ? (
        <FullServiceDetails
          key={services?.length | 0}
          tempService={null}
        ></FullServiceDetails>
      ) : null}
    </div>
  );
};
export default Service;
