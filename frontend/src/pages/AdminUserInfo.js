import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";

const AdminUserInfo = () => {
  const { adminUserInfo } = useContext(AuthContext);
  const [adminInfo, setAdminInfo] = useState();
  console.log(adminInfo);

  useEffect(() => {
    setAdminInfo(adminUserInfo);
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
            adminInfo?.users.map((user) => (
              <div
                key={`user_${user.id}`}
                className="flex flex-row-reverse items-center gap-3 p-3"
              >
                <button
                  className="button absolute right-10 mt-1 bg-green-700 transition-all duration-500 hover:bg-green-800"
                  onClick={() => {
                    updateEmployeeStatus(true, user);
                  }}
                >
                  Hire
                </button>
                <h1 className="text-lg">{user.displayName}</h1>
                <img
                  src={user.profilePicture}
                  className="h-11 w-11 rounded-full"
                  alt="Profile"
                />
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
                className="mb-3 flex flex-row-reverse items-center gap-3 p-3"
              >
                <button
                  className="button absolute right-10 mt-1 bg-red-700 transition-all duration-500 hover:bg-red-800"
                  onClick={() => {
                    updateEmployeeStatus(false, employee);
                  }}
                >
                  Fire
                </button>
                <h1 className="text-lg">{employee.displayName}</h1>
                <img
                  src={employee.profilePicture}
                  className="h-11 w-11 rounded-full"
                  alt="Profile"
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserInfo;
