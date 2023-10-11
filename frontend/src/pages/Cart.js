import axios from "axios";
import { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import DateTimePicker from "../components/DateTimePicker";
import AuthContext from "../context/AuthContext";
import BookingsContext from "../context/BookingsContext";
import CartContext from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const imageDirectory = "https://ramsaysdetailing.ca:4000/images/";

  const {
    cart,
    removeFromCartContext,
    selectedDateTime,
    setSelectedDateTime,
    fetchBusyTimes,
    clearCartContext,
    setBusyTimes,
  } = useContext(CartContext);
  const { fetchBookings, bookings } = useContext(BookingsContext);

  const { isEmployee } = useContext(AuthContext);

  var [address, setAddress] = useState("");
  // var [addressValid, setAddressValid] = useState(true);
  var [addressSuggestions, setAddressSuggestions] = useState([]);
  const [bookingError, setBookingError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [isChecked, setIsChecked] = useState(false); // Create state variable

  function isValidPhoneNumber(phoneNumber) {
    if (
      phoneNumber !== null &&
      phoneNumber !== undefined &&
      phoneNumber.length > 9
    ) {
      // Remove any non-digit characters from the input
      const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");

      // Check if the phone number has the correct length (e.g., 10 digits for a US number)
      const isValidLength = cleanedPhoneNumber.length === 10;

      // Check if the phone number consists of only digits
      const hasOnlyDigits = /^\d+$/.test(cleanedPhoneNumber);

      return isValidLength && hasOnlyDigits;
    } else {
      return false;
    }
  }

  async function createCalendarEvent() {
    setBookingError("");

    if (!isValidPhoneNumber(phoneNumber)) {
      setBookingError("Please Enter A Valid Phone Number");
      return;
    }

    if (address === "") {
      setBookingError("Please Enter A Valid Address");
      return;
    }

    if (!selectedDateTime) {
      setBookingError("Please Pick A Date And Time");
      return;
    }
    var numberOfUnClaimedBookings = 0;
    const maxUnClaimedBookings = 1;
    bookings.map((booking) => {
      if (booking.employeeId === "none") {
        numberOfUnClaimedBookings++;
      }
      return booking;
    });

    if (numberOfUnClaimedBookings >= maxUnClaimedBookings) {
      setBookingError(
        "Too Many Un-Claimed Bookings, Wait Until Your Previous Booking Has Been Claimed By An Employee"
      );
      return;
    }

    if (isEmployee) {
      setBookingError("Employees Cannot Create Bookings");
      return;
    }

    try {
      cart.phoneNumber = phoneNumber;
      cart.address = address;
      console.log(selectedDateTime);
      const bookingResponse = await axios.post(
        "https://ramsaysdetailing.ca:4000/api/bookings",
        {
          cart,
          selectedDateTime,
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const bookingData = bookingResponse.data;
      if (bookingResponse.status === 200) {
        const bookingData = bookingResponse.data;
        if (isChecked) {
          const calendarResponse = await axios.post(
            "https://ramsaysdetailing.ca:4000/calendar",
            {
              cart,
              selectedDateTime,
            },
            {
              withCredentials: true, // Include cookies in the request
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const calendarData = calendarResponse.data;

          if (calendarResponse.status === 200) {
            await axios.patch(
              "https://ramsaysdetailing.ca:4000/api/bookings/setUserEventID",
              {
                userEventId: calendarData,
                bookingId: bookingData._id,
              },
              {
                withCredentials: true, // Include cookies in the request
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          } else {
            console.log(calendarData);
          }
        }
        setSelectedDateTime(undefined);
        clearCartContext();
        fetchBookings();
        setBusyTimes(undefined);
        navigate("https://ramsaysdetailing.ca/bookings");
      } else {
        console.error(bookingData);
        setBookingError(bookingData);
      }
    } catch (error) {
      console.error("Error occurred while creating calendar event:", error);
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion);
    setAddressSuggestions([]);
    console.log(cart);
    fetchBusyTimes({
      customerLocation: suggestion,
      expectedTimeToComplete: cart.timeToComplete,
      serviceName: cart.services[0].title,
    });
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

  const handleAddressChange = useCallback(async (e) => {
    setAddress(e.target.value);
    // const isValid = await confirmAddressExists(address);
    // setAddressValid(isValid);``
  }, []);
  // async function confirmAddressExists(address) {
  //   try {
  //     const response = await fetch(`/confirm-address?address=${encodeURIComponent(address)}`);
  //     const data = await response.json();

  //     if (data.valid) {
  //       console.log('Address is valid');
  //       const formattedAddress = data.formattedAddress;
  //       console.log('Formatted Address:', formattedAddress);
  //       return true;
  //     } else {
  //       console.log('Address is invalid or not found');
  //       return false;
  //     }
  //   } catch (error) {
  //     console.log('Error occurred while confirming address:', error);
  //     return false;
  //   }
  // }

  try {
    if (cart.services.length > 0) {
      return (
        <div className="mx-10 flex flex-col items-center justify-center gap-10 py-10">
          <div className="rounded-lg bg-primary-0 p-8 pb-16 text-center md:p-10">
            <div
              className={
                "grid gap-10 " +
                (cart.services.length > 2 ? "2xl:grid-cols-3 " : " ") +
                (cart.services.length > 1 ? "md:grid-cols-2 " : " ")
              }
            >
              {cart.services &&
                cart.services.map((service, index) => (
                  <div
                    key={`${service._id}-${index}`}
                    className="flex flex-col gap-2 border bg-secondary-0 p-3 font-bold"
                  >
                    <img
                      src={imageDirectory + service.localImageName}
                      alt={service.title + " Image"}
                      className=""
                    />
                    <h1 className="title mb-3 text-lg lg:text-xl">
                      {service.title}: ${service.price}
                    </h1>

                    {service.answeredQuestions &&
                      service.answeredQuestions.map(
                        (answeredQuestion, qIndex) => (
                          <div
                            key={`${answeredQuestion._id}-${qIndex}`}
                            className=""
                          >
                            <h1>
                              {answeredQuestion.question}:{" "}
                              {answeredQuestion.answer}
                            </h1>
                          </div>
                        )
                      )}

                    <button
                      onClick={() => removeFromCartContext(service)}
                      className="button mt-3 bg-red-600 transition-all duration-500 hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>

            <span className="mt-5 flex flex-row text-lg lg:text-xl">
              <h1 key="price">Total Cost: $</h1>
              <h1 className="font-sans">{cart.price}</h1>
            </span>
          </div>

          <div className="mx-10 flex max-w-fit flex-col items-center gap-3 rounded-lg bg-primary-0 p-10">
            <div className="flex flex-col gap-5 md:flex-row md:gap-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder=" Address"
                  value={address || ""}
                  onChange={handleAddressChange}
                  onKeyUp={handleAddressSuggestions}
                  className="h-8 w-64 rounded-md font-sans text-black"
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
              <div>
                <input
                  type="text"
                  placeholder=" Phone Number"
                  value={phoneNumber || ""}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
              <DateTimePicker />

              <div className="flex flex-row gap-3 font-sans">
                <input
                  type="checkbox"
                  className="w-4"
                  checked={isChecked} // Attach state to the checkbox
                  onChange={(e) => setIsChecked(e.target.checked)} // Update state when checkbox is clicked
                />
                <h1>Add Booking To My Calendar</h1>
              </div>
            </div>

            <div className="mt-8 flex flex-row">
              <h1 key="price" className="mt-[2px]">
                Total Cost:{" "}
              </h1>
              <h1 className="ml-2 font-sans text-lg">${cart.price}</h1>
            </div>
            <button
              className="button mt-3 bg-ramsayBlue-0 transition-all duration-500 hover:bg-blue-800"
              onClick={createCalendarEvent}
            >
              Book Detailing
            </button>
            <p>{bookingError}</p>
          </div>
        </div>
      );
    }
  } catch (error) {}

  return (
    <div className="flex justify-center pt-10 text-xl">
      <h1>Your cart is empty...</h1>
    </div>
  );
};
export default Cart;
