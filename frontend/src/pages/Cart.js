import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DateTimePicker from "../components/DateTimePicker";
import AuthContext from "../context/AuthContext";
import BookingsContext from "../context/BookingsContext";
import CartContext from "../context/CartContext";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

const Cart = () => {
  const navigate = useNavigate();
  const imageDirectory = "https://ramsaysdetailing.ca:4000/images/";
  const stripePromise = loadStripe(
    "pk_test_51NKxGTDXNQXcJQtnMzzJXLcE04Xi9B5eRt2koClKaWBUjJ7PZk9izcjtbkL57emaTo8GQBmHSOwwmTuqqp2pmsxX00Vhvkda9F"
  );

  const {
    cart,
    setCart,
    removeFromCartContext,
    selectedDateTime,
    fetchBusyTimes,
    clearCartContext,
  } = useContext(CartContext);
  const { fetchBookings, bookings } = useContext(BookingsContext);

  const { isEmployee } = useContext(AuthContext);

  // var [addressValid, setAddressValid] = useState(true);
  var [addressSuggestions, setAddressSuggestions] = useState([]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      createBooking();
      console.log("Payment Complete", cart);
      toast.success("Payment Complete");
    }
    if (query.get("canceled")) {
      toast.error("Payment Canceled");
    }
  }, [navigate]);

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

  async function preBooking() {
    if (!isValidPhoneNumber(cart.phoneNumber)) {
      toast.error("Please Enter A Valid Phone Number");
      return;
    }

    if (cart.address === "") {
      toast.error("Please Enter A Valid Address");
      return;
    }

    if (!cart.selectedDateTime) {
      toast.error("Please Pick A Date And Time");
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
      toast.error(
        "Too Many Un-Claimed Bookings, Wait Until Your Previous Booking Has Been Claimed By An Employee"
      );
      return;
    }

    if (isEmployee) {
      toast.error("Employees Cannot Create Bookings");
      return;
    }

    try {
      const preBookingResponse = await axios.post(
        "https://ramsaysdetailing.ca:4000/api/bookings/pre",
        {
          cart,
          selectedDateTime: cart.selectedDateTime,
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const preBookingData = preBookingResponse.data;
      if (preBookingResponse.status === 200) {
        handleCheckout();
      } else {
        toast.error(preBookingData);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function createBooking() {
    try {
      console.log(selectedDateTime);
      const bookingResponse = await axios.post(
        "https://ramsaysdetailing.ca:4000/api/bookings",
        {
          cart,
          selectedDateTime: cart.selectedDateTime,
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
        toast.success("Booking Created");
        if (cart.createCalendarEvent) {
          const calendarResponse = await axios.post(
            "https://ramsaysdetailing.ca:4000/calendar",
            {
              cart,
              selectedDateTime: cart.selectedDateTime,
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
            toast.success("Booking Added To Your Google Calendar");
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
        clearCartContext();
        fetchBookings();
        navigate("/bookings");
      } else {
        console.error(bookingData);
        toast.error(bookingData);
      }
    } catch (error) {
      console.error("Error occurred while creating calendar event:", error);
    }
  }

  const handleCheckout = async () => {
    try {
      const items = cart.services.map((service) => {
        return {
          price_data: {
            currency: "cad",
            product_data: {
              name: service.title,
            },
            unit_amount: service.price * 100, // Replace with the actual price in cents
          },
          quantity: 1,
        };
      });

      // Initiate Stripe Checkout session and get the session ID
      const sessionResponse = await axios.post(
        "https://ramsaysdetailing.ca:4000/stripe/createCheckoutSession",
        {
          items,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const sessionData = sessionResponse.data;
      const sessionId = sessionData.sessionId;

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({
        sessionId,
      });

      if (result.error) {
        toast.error("Error redirecting to Checkout");
        console.error("Error redirecting to Checkout:", result.error);
      }
    } catch (error) {
      toast.error("Error initiating Checkout");
      console.error("Error initiating Checkout:", error.message);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCart((prev) => ({ ...prev, address: suggestion }));
    setAddressSuggestions([]);
    console.log(cart);
    fetchBusyTimes({
      customerLocation: suggestion,
      expectedTimeToComplete: cart.timeToComplete,
      serviceNames: cart.services.map((service) => service.title),
    });
  };

  const handleAddressSuggestions = useCallback(async (e) => {
    const inputAddress = e.target.value;
    setCart((prev) => ({ ...prev, address: inputAddress }));

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
    setCart((prev) => ({ ...prev, address: e.target.value }));
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
          <script src="https://js.stripe.com/v3/"></script>
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
                  value={cart.address || ""}
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
                  value={cart.phoneNumber || ""}
                  onChange={(e) =>
                    setCart((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="h-8 w-64 rounded-md font-sans text-black"
                />
              </div>
              <DateTimePicker />

              <div className="flex flex-row gap-3 font-sans">
                <input
                  type="checkbox"
                  className="w-4"
                  checked={cart.createCalendarEvent || false} // Attach state to the checkbox
                  onChange={(e) =>
                    setCart((prev) => ({
                      ...prev,
                      createCalendarEvent: e.target.checked,
                    }))
                  } // Update state when checkbox is clicked
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
              onClick={preBooking}
            >
              Book Detailing
            </button>
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
