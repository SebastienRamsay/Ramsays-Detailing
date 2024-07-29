import axios from "axios";
import { DateTime } from "luxon";
import { useCallback, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AuthContext from "../context/AuthContext";
import ServicesContext from "../context/ServicesContext";
import toast from "react-hot-toast";

const EmployeeInfo = () => {
  const navigate = useNavigate();
  const {
    getLoggedIn,
    adminInfo,
    requestUpdateEmployeeInfo,
    deleteStripeAccount,
    connectStripeAccount,
  } = useContext(AuthContext);
  const { services } = useContext(ServicesContext);
  const [availableServices, setAvailableServices] = useState(
    adminInfo.availableServices || []
  );
  const [distance, setDistance] = useState(adminInfo.distance || 50);
  var [address, setAddress] = useState(adminInfo.location || "");
  var [addressSuggestions, setAddressSuggestions] = useState([]);
  const [scheduleError, setScheduleError] = useState("");
  const [vacationTime, setVacationTime] = useState({
    startDate:
      adminInfo.vacationTime?.startDate &&
      DateTime.fromISO(adminInfo.vacationTime.startDate).isValid
        ? DateTime.fromISO(adminInfo.vacationTime.startDate).toJSDate()
        : null,
    endDate:
      adminInfo.vacationTime?.endDate &&
      DateTime.fromISO(adminInfo.vacationTime.endDate).isValid
        ? DateTime.fromISO(adminInfo.vacationTime.endDate).toJSDate()
        : null,
  });
  const defaultStartTime = new Date();
  defaultStartTime.setHours(8, 0, 0, 0);
  const defaultEndTime = new Date();
  defaultEndTime.setHours(15, 0, 0, 0);
  const [schedule, setSchedule] = useState({
    sunday: {
      startTime:
        DateTime.fromISO(adminInfo.schedule.sunday?.startTime).toJSDate() ||
        defaultStartTime,
      endTime:
        DateTime.fromISO(adminInfo.schedule.sunday?.endTime).toJSDate() ||
        defaultEndTime,
    },
    monday: {
      startTime:
        DateTime.fromISO(adminInfo.schedule.monday?.startTime).toJSDate() ||
        defaultStartTime,
      endTime:
        DateTime.fromISO(adminInfo.schedule.monday?.endTime).toJSDate() ||
        defaultEndTime,
    },
    tuesday: {
      startTime:
        DateTime.fromISO(adminInfo.schedule.tuesday?.startTime).toJSDate() ||
        defaultStartTime,
      endTime:
        DateTime.fromISO(adminInfo.schedule.tuesday?.endTime).toJSDate() ||
        defaultEndTime,
    },
    wednesday: {
      startTime:
        DateTime.fromISO(adminInfo.schedule.wednesday?.startTime).toJSDate() ||
        defaultStartTime,
      endTime:
        DateTime.fromISO(adminInfo.schedule.wednesday?.endTime).toJSDate() ||
        defaultEndTime,
    },
    thursday: {
      startTime:
        DateTime.fromISO(adminInfo.schedule.thursday?.startTime).toJSDate() ||
        defaultStartTime,
      endTime:
        DateTime.fromISO(adminInfo.schedule.thursday?.endTime).toJSDate() ||
        defaultEndTime,
    },
    friday: {
      startTime:
        DateTime.fromISO(adminInfo.schedule.friday?.startTime).toJSDate() ||
        defaultStartTime,
      endTime:
        DateTime.fromISO(adminInfo.schedule.friday?.endTime).toJSDate() ||
        defaultEndTime,
    },
    saturday: {
      startTime:
        DateTime.fromISO(adminInfo.schedule.saturday?.startTime).toJSDate() ||
        defaultStartTime,
      endTime:
        DateTime.fromISO(adminInfo.schedule.saturday?.endTime).toJSDate() ||
        defaultEndTime,
    },
  });
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;

    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      async function stripeStuff() {
        await connectStripeAccount();
        await getLoggedIn();
        setTimeout(() => {
          // Navigate to /bookings after 2 seconds
          navigate("/employee");
        }, 2000); // 2000 milliseconds = 2 seconds
      }
      stripeStuff();
      toast.success("Stripe Account Connected");
    }
    hasRunRef.current = true;
  }, [getLoggedIn, connectStripeAccount, navigate]);

  const resetVacationTime = async () => {
    setVacationTime({
      startDate: "",
      endDate: "",
    });
  };

  const resetSchedule = async () => {
    setSchedule({
      sunday: {
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      },
      monday: {
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      },
      tuesday: {
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      },
      wednesday: {
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      },
      thursday: {
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      },
      friday: {
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      },
      saturday: {
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      },
    });
  };

  const handleServiceToggle = (serviceTitle) => {
    setAvailableServices((prevServices) => {
      if (!Array.isArray(prevServices)) {
        prevServices = [];
      }

      if (prevServices.includes(serviceTitle)) {
        return prevServices.filter((title) => title !== serviceTitle);
      } else {
        return [...prevServices, serviceTitle];
      }
    });
  };

  const updateSchedule = async (e) => {
    e.preventDefault();

    try {
      setScheduleError();
      const response = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/user/employee/info/schedule",
        {
          schedule,
          vacationTime,
        },
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      setScheduleError(response.data);
      getLoggedIn();
    } catch (error) {
      console.log("Error Updating Schedule: " + error);
      toast.error("Error Updating Schedule: " + error);
    }
  };

  const handleAddressChange = useCallback(async (e) => {
    setAddress(e.target.value);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion);
    setAddressSuggestions([]);
  };

  const handleAddressSuggestions = useCallback(async (e) => {
    const inputAddress = e.target.value;
    setAddress(inputAddress);

    if (inputAddress.length < 5) {
      setAddressSuggestions([]);
      return;
    }

    if (inputAddress.trim() === "") {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://ramsaysdetailing.ca:4000/places/autocomplete?input=${encodeURIComponent(
          inputAddress
        )}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        try {
          const data = await response.json();

          if (data.status === "OK") {
            setAddressSuggestions(
              data.predictions.map((prediction) => prediction.description)
            );
          } else {
            setAddressSuggestions([]);
          }
        } catch (error) {
          console.error("Error occurred while parsing response:", error);
          setAddressSuggestions([]);
        }
      } else if (response.status === 304) {
        // Handle the case where the data has not been modified
        // Use the cached data or take appropriate action
      } else {
        // Handle other error cases
        console.error(
          "Error occurred while fetching address suggestions:",
          response.status
        );
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error(
        "Error occurred while fetching address suggestions:",
        error
      );
      setAddressSuggestions([]);
    }
  }, []);

  return (
    <div className="flex flex-col justify-center gap-10 bg-secondary-0 py-10">
      <div className="mx-auto flex flex-col items-center justify-center rounded-3xl bg-primary-0 px-5 pb-5 text-center shadow-2xl">
        <h3 className="m-10 flex justify-center text-3xl">
          <b>Employee Info</b>
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestUpdateEmployeeInfo(address, availableServices, distance);
          }}
          className="flex flex-col gap-3 md:flex-row md:gap-10"
        >
          <div className="">
            <label className="mr-3 text-lg font-bold">Your Location:</label>
            <input
              type="text"
              placeholder=" Address"
              value={address || ""}
              onChange={handleAddressChange}
              onKeyUp={handleAddressSuggestions}
              className=" mt-6 h-8 w-52 rounded-md font-sans text-black"
            />
            {addressSuggestions.length > 0 && (
              <div className="top-15 absolute rounded-lg bg-primary-0">
                {addressSuggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    className="p-2 font-sans not-italic text-white hover:bg-white hover:text-black"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="">
            <div className="flex flex-row gap-3 font-sans">
              <label className="font-medium">Max Booking Distance:</label>
              <label className="text-xl">{distance || 50}km</label>
            </div>

            <input
              type="range"
              className="h-2 w-full appearance-none rounded-full bg-gray-300 outline-none ring-ramsayBlueHover-0"
              min="5"
              max="50"
              step="1"
              value={distance || 50}
              onChange={(e) => {
                setDistance(e.target.value);
              }}
            />
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-white">5km</span>
              <span className="text-white">50km</span>
            </div>
          </div>
          <div className=" font-sans text-lg">
            <label>Trained Services:</label>
            {services &&
              services.map((service) => (
                <div key={service.title} className="flex flex-row gap-3">
                  <label>
                    {service.title} -{">"}
                  </label>
                  <input
                    type="checkbox"
                    key={service.title}
                    checked={
                      availableServices?.includes(service.title) || false
                    }
                    onChange={() => handleServiceToggle(service.title)}
                  />
                </div>
              ))}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              const response = requestUpdateEmployeeInfo(
                address,
                availableServices,
                distance
              );
              if (response.status === 200) {
                toast.success("Request Sent Successfully");
              } else {
                toast.error("Request Failed");
              }
            }}
            className="button mt-5 bg-ramsayBlue-0 text-white hover:bg-blue-800 sm:mt-0"
          >
            Update Info
          </button>
        </form>
      </div>
      <div className="mx-auto flex flex-col items-center gap-10 rounded-3xl bg-primary-0 p-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-xl">Vacation Time</h1>

          <div className="flex flex-col gap-3 md:flex-row">
            <div>
              <h1>Vacation Start</h1>
              <DatePicker
                selected={vacationTime.startDate || ""}
                onChange={(startDate) => {
                  setVacationTime((current) => ({
                    ...current,
                    startDate: startDate,
                  }));
                }}
                minDate={new Date()}
                maxDate={vacationTime?.endDate || null}
                timeFormat="h:mm aa"
                dateFormat="yyyy-MM-dd h:mm aa"
                placeholderText="Select Vacation Start Date"
                timeZone="America/New_York"
                className="h-8 w-64 rounded-md font-sans text-black"
              />
            </div>
            <div>
              <h1>Vacation End</h1>
              <DatePicker
                selected={vacationTime.endDate || ""}
                onChange={(endDate) => {
                  setVacationTime((current) => ({
                    ...current,
                    endDate: endDate,
                  }));
                }}
                minDate={vacationTime?.startDate || null}
                timeFormat="h:mm aa"
                dateFormat="yyyy-MM-dd h:mm aa"
                placeholderText="Select Vacation End Date"
                timeZone="America/New_York"
                className="h-8 w-64 rounded-md font-sans text-black"
              />
            </div>
          </div>
          <button
            onClick={resetVacationTime}
            className="button bg-red-600 text-white hover:bg-red-700 sm:mt-0"
          >
            Clear Vacation
          </button>
        </div>
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-xl">Schedule</h1>
          <div className="flex flex-row gap-5">
            <div className="hidden flex-col items-start gap-5 md:mt-1 md:flex">
              <h1>Sunday</h1>
              <h1>Monday</h1>
              <h1>Tuesday</h1>
              <h1>Wednesday</h1>
              <h1>Thursday</h1>
              <h1>Friday</h1>
              <h1>Saturday</h1>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <h1 className="flex md:hidden">Sunday</h1>
                <DatePicker
                  selected={schedule.sunday.startTime || defaultStartTime}
                  onChange={(startTime) => {
                    setSchedule((current) => ({
                      ...current,
                      sunday: {
                        ...current.sunday,
                        startTime: startTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Sunday Start Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
                <DatePicker
                  selected={schedule.sunday.endTime || defaultEndTime}
                  onChange={(endTime) => {
                    setSchedule((current) => ({
                      ...current,
                      sunday: {
                        ...current.sunday,
                        endTime: endTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Sunday End Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <h1 className="flex md:hidden">Monday</h1>
                <DatePicker
                  selected={schedule.monday.startTime || defaultStartTime}
                  onChange={(startTime) => {
                    setSchedule((current) => ({
                      ...current,
                      monday: {
                        ...current.monday,
                        startTime: startTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Monday Start Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
                <DatePicker
                  selected={schedule.monday.endTime || defaultEndTime}
                  onChange={(endTime) => {
                    setSchedule((current) => ({
                      ...current,
                      monday: {
                        ...current.monday,
                        endTime: endTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Monday End Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <h1 className="flex md:hidden">Tuesday</h1>
                <DatePicker
                  selected={schedule.tuesday.startTime || defaultStartTime}
                  onChange={(startTime) => {
                    setSchedule((current) => ({
                      ...current,
                      tuesday: {
                        ...current.tuesday,
                        startTime: startTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Tuesday Start Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
                <DatePicker
                  selected={schedule.tuesday.endTime || defaultEndTime}
                  onChange={(endTime) => {
                    setSchedule((current) => ({
                      ...current,
                      tuesday: {
                        ...current.tuesday,
                        endTime: endTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Tuesday End Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <h1 className="flex md:hidden">Wednesday</h1>
                <DatePicker
                  selected={schedule.wednesday.startTime || defaultStartTime}
                  onChange={(startTime) => {
                    setSchedule((current) => ({
                      ...current,
                      wednesday: {
                        ...current.wednesday,
                        startTime: startTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Wednesday Start Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
                <DatePicker
                  selected={schedule.wednesday.endTime || defaultEndTime}
                  onChange={(endTime) => {
                    setSchedule((current) => ({
                      ...current,
                      wednesday: {
                        ...current.wednesday,
                        endTime: endTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Wednesday End Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <h1 className="flex md:hidden">Thursday</h1>
                <DatePicker
                  selected={schedule.thursday.startTime || defaultStartTime}
                  onChange={(startTime) => {
                    setSchedule((current) => ({
                      ...current,
                      thursday: {
                        ...current.thursday,
                        startTime: startTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Thursday Start Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
                <DatePicker
                  selected={schedule.thursday.endTime || defaultEndTime}
                  onChange={(endTime) => {
                    setSchedule((current) => ({
                      ...current,
                      thursday: {
                        ...current.thursday,
                        endTime: endTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Thursday End Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <h1 className="flex md:hidden">Friday</h1>
                <DatePicker
                  selected={schedule.friday.startTime || defaultStartTime}
                  onChange={(startTime) => {
                    setSchedule((current) => ({
                      ...current,
                      friday: {
                        ...current.friday,
                        startTime: startTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Friday Start Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
                <DatePicker
                  selected={schedule.friday.endTime || defaultEndTime}
                  onChange={(endTime) => {
                    setSchedule((current) => ({
                      ...current,
                      friday: {
                        ...current.friday,
                        endTime: endTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Friday End Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <h1 className="flex md:hidden">Saturday</h1>
                <DatePicker
                  selected={schedule.saturday.startTime || defaultStartTime}
                  onChange={(startTime) => {
                    setSchedule((current) => ({
                      ...current,
                      saturday: {
                        ...current.saturday,
                        startTime: startTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Saturday Start Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
                <DatePicker
                  selected={schedule.saturday.endTime || defaultEndTime}
                  onChange={(endTime) => {
                    setSchedule((current) => ({
                      ...current,
                      saturday: {
                        ...current.saturday,
                        endTime: endTime,
                      },
                    }));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  minTime={defaultStartTime}
                  maxTime={defaultEndTime}
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select Saturday End Time"
                  timeZone="America/New_York"
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-3">
          <button
            onClick={resetSchedule}
            className="button bg-red-700 text-white hover:bg-red-800 sm:mt-0"
          >
            Reset Schedule
          </button>
          <button
            onClick={updateSchedule}
            className="button bg-ramsayBlue-0 text-white hover:bg-blue-800 sm:mt-0"
          >
            Update Schedule
          </button>
        </div>

        {scheduleError}
      </div>

      <div className="mx-auto flex flex-col items-center justify-center rounded-3xl bg-primary-0 px-5 py-5 text-center shadow-2xl">
        <h3 className="mb-3 flex justify-center text-3xl">
          <b>Stripe Account</b>
        </h3>
        <div>
          <h4 className="text-2xl font-bold">Account Status: </h4>
          {adminInfo.stripeId === undefined ? (
            <>
              <h4 className="text-red-600">No Account</h4>
              <br />
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  const url = await connectStripeAccount();
                  if (url) {
                    window.location.href = url;
                  }
                }}
                className="button mt-5 bg-green-600 text-white hover:bg-green-800 sm:mt-0"
              >
                Connect Stripe Account
              </button>
            </>
          ) : adminInfo.onboardingComplete ? (
            <>
              <h4 className="text-green-600">Account Connected</h4>
              <br />
              <button
                onClick={async (e) => {
                  await deleteStripeAccount();
                  await getLoggedIn();
                }}
                className="button mt-5 bg-red-600 text-white hover:bg-red-800 sm:mt-0"
              >
                Delete Stripe Account
              </button>
            </>
          ) : (
            <>
              <h4 className="text-blue-600">Waiting for user information...</h4>
              <br />
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  const url = await connectStripeAccount();
                  if (url) {
                    window.location.href = url;
                  }
                }}
                className="button mt-5 bg-green-600 text-white hover:bg-green-800 sm:mt-0"
              >
                Connect Stripe Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfo;
