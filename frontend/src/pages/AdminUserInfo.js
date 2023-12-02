import axios from "axios";
import { useContext, useEffect, useState, useRef } from "react";
import AuthContext from "../context/AuthContext";

const AdminUserInfo = () => {
  var isMounted = useRef(false);
  const { adminUserInfo, updateEmployeeInfo } = useContext(AuthContext);
  const [adminInfo, setAdminInfo] = useState();
  adminInfo && console.log(adminInfo);

  useEffect(() => {
    if (!isMounted.current && adminUserInfo) {
      setAdminInfo(adminUserInfo);
      console.log(adminUserInfo);
      isMounted.current = true;
    }
  }, [adminUserInfo]);

  const updateEmployeeStatus = async (isEmployee, user) => {
    try {
      const response = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/user/employee",
        {
          isEmployee,
          employeeID: user.id,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update adminUserInfo instead of directly setting data
        const updatedAdminInfo = { ...adminInfo };

        // Update the corresponding array based on the change
        if (user.isEmployee) {
          updatedAdminInfo.employees = updatedAdminInfo.employees.filter(
            (employee) => employee.id !== user.id
          );
          user.isEmployee = false;
          updatedAdminInfo.users.push(user);
        } else {
          updatedAdminInfo.users = updatedAdminInfo.users.filter(
            (u) => u.id !== user.id
          );
          user.isEmployee = true;
          updatedAdminInfo.employees.push(user);
        }

        setAdminInfo(updatedAdminInfo);
      }
    } catch (error) {
      console.log("Error when updating employee status: " + error);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-10 bg-secondary-0 py-10 md:flex-row">
      {adminInfo?.users?.length > 0 && (
        <div className="relative flex flex-col items-start rounded-3xl bg-primary-0 px-10 py-5 pb-5 sm:mx-10 sm:w-[500px] md:mx-10">
          <h1 className="pb-3 text-xl font-bold">Users</h1>

          {adminInfo?.users?.length > 0 &&
            adminInfo?.users.map((user, i) => (
              <div className="flex flex-col gap-3 p-3" key={`user_${user.id}`}>
                <button
                  className="button absolute right-10 mt-1 bg-green-700 transition-all duration-500 hover:bg-green-600"
                  onClick={() => {
                    updateEmployeeStatus(true, user);
                  }}
                >
                  Hire
                </button>
                <div className="flex items-center gap-2">
                  <img
                    src={user.profilePicture}
                    className="h-11 w-11 rounded-full"
                    alt="Profile"
                  />
                  <h1 className="text-lg">{user.displayName}</h1>
                </div>
                <h2 className="ml-12">Email: {user.email}</h2>
                {user?.phoneNumber && <h2>Phone Number: {user.phoneNumber}</h2>}
              </div>
            ))}
        </div>
      )}
      {adminInfo?.employees?.length > 0 && (
        <div className="relative flex flex-col items-start justify-center rounded-3xl bg-primary-0 px-10 py-5 pb-5 sm:mx-10 sm:w-[500px]">
          <h1 className="pb-3 text-xl font-bold">Employees</h1>
          {adminInfo?.employees?.length > 0 &&
            adminInfo?.employees.map((employee) => (
              <div
                key={`employee_${employee.id}`}
                className="mb-3 flex flex-col gap-3 p-3"
              >
                <button
                  className="button absolute right-10 mt-1 bg-red-700 transition-all duration-500 hover:bg-red-800"
                  onClick={() => {
                    updateEmployeeStatus(false, employee);
                  }}
                >
                  Fire
                </button>
                <div className="flex items-center gap-2">
                  <img
                    src={employee.profilePicture}
                    className="h-11 w-11 rounded-full"
                    alt="Profile"
                  />
                  <h1 className="text-lg">{employee.displayName}</h1>
                </div>{" "}
                <h2 className="ml-6">Email: {employee.email}</h2>
                {employee?.phoneNumber && (
                  <h2>Phone Number: {employee.phoneNumber}</h2>
                )}
                {employee?.distance && employee.distance !== undefined && (
                  <div className="ml-6 flex gap-3">
                    <h2>Distance:</h2>
                    <h3 className="font-sans">{employee.distance + " "}KM</h3>
                  </div>
                )}
                {employee?.location && employee.location !== undefined && (
                  <div className="ml-6 flex gap-3">
                    <h2>Location:</h2>
                    <h3 className="font-sans">{employee.location + " "}</h3>
                  </div>
                )}
                {employee?.services &&
                  employee.services !== undefined &&
                  employee.services.length > 0 && (
                    <>
                      <h2>Services:</h2>
                      {employee.services.map((service, i) => (
                        <h3 key={i} className="ml-5">
                          {service}
                        </h3>
                      ))}
                    </>
                  )}
                {(employee?.requestedDistance !== undefined ||
                  (employee?.requestedLocation !== "" &&
                    employee?.requestedLocation !== undefined) ||
                  (employee?.requestedServices?.length !== 0 &&
                    employee?.requestedServices?.length !== undefined)) && (
                  <>
                    {employee?.requestedDistance &&
                      employee.requestedDistance !== undefined && (
                        <div className="mt-5 flex gap-3">
                          <h2>Requested Distance:</h2>
                          <h3 className="font-sans">
                            {employee.requestedDistance + " "}KM
                          </h3>
                        </div>
                      )}

                    {employee?.requestedLocation &&
                      employee.requestedLocation !== undefined && (
                        <div className=" flex gap-3">
                          <h2>Requested Location:</h2>
                          <h3 className="font-sans">
                            {employee.requestedLocation + " "}
                          </h3>
                        </div>
                      )}
                    {employee?.requestedServices &&
                      employee.requestedServices !== undefined &&
                      employee.requestedServices.length > 0 && (
                        <>
                          <h2>Requested Services:</h2>
                          {employee.requestedServices.map((service, i) => (
                            <h3 key={i} className="ml-5">
                              {service}
                            </h3>
                          ))}
                        </>
                      )}
                    <button
                      className="button absolute bottom-3 right-10 mt-1 bg-green-700 transition-all duration-500 hover:bg-green-600"
                      onClick={() => {
                        updateEmployeeInfo(
                          employee.requestedLocation,
                          employee.requestedServices,
                          employee.requestedDistance,
                          employee.id
                        );

                        // Create a copy of the adminInfo and modify the employee in the copy
                        const temp = {
                          ...adminInfo,
                          employees: adminInfo.employees.map((newEmployee) => {
                            if (employee.id === newEmployee.id) {
                              // Create a new object with the updated properties
                              return {
                                ...newEmployee,
                                requestedDistance: undefined,
                                requestedServices: undefined,
                                requestedLocation: undefined,
                                distance: employee.requestedDistance,
                                services: employee.requestedServices,
                                location: employee.requestedLocation,
                              };
                            }
                            return newEmployee; // Return unchanged employee if it's not the target employee
                          }),
                        };

                        // Update the state with the modified adminInfo
                        setAdminInfo(temp);
                      }}
                    >
                      Accept
                    </button>
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserInfo;
