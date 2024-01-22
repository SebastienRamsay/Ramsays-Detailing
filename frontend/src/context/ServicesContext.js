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
      const response = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/admin/services",
        {
          service,
        },
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Service Updated");
        setServices((prev) => {
          let temp = [...prev];
          temp.map((Service) => {
            if (service._id === Service._id) {
              Service = response.data.updateService;
            }
            return Service;
          });
          return temp;
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  async function newService(service) {
    try {
      const response = await axios.post(
        "https://ramsaysdetailing.ca:4000/api/admin/services",
        {
          service,
        },
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Service Created");
        setServices((prev) => {
          let temp = [...prev];
          temp.push(response.data.newService);
          return temp;
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  async function deleteService(serviceID) {
    try {
      const response = await axios.delete(
        `https://ramsaysdetailing.ca:4000/api/admin/services/${serviceID}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Service Deleted");
        setServices((prev) => {
          let temp = [...prev];
          temp = temp.filter((s) => s._id !== serviceID);
          return temp;
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  useEffect(() => {
    getServices();
  }, []);

  return (
    <ServicesContext.Provider
      value={{
        services,
        getServices,
        updateService,
        newService,
        setServices,
        deleteService,
      }}
    >
      {props.children}
    </ServicesContext.Provider>
  );
}

export default ServicesContext;

export { ServicesContextProvider };
