import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const ServicesContext = createContext();

function ServicesContextProvider(props) {
  const [services, setServices] = useState(undefined);

  async function getServices() {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/services",
        {
          withCredentials: true,
        }
      );
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  async function updateService(service) {
    try {
      const response = await axios.post(
        "https://www.ramsaysdetailing.ca:4000/api/services",
        {
          withCredentials: true,
        },
        {
          service,
        }
      );
      if (response.status === 200) {
        toast.success("Service Updated");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  useEffect(() => {
    getServices();
  }, []);

  return (
    <ServicesContext.Provider value={{ services, getServices, updateService }}>
      {props.children}
    </ServicesContext.Provider>
  );
}

export default ServicesContext;

export { ServicesContextProvider };
