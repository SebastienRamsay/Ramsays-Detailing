import axios from "axios";
import { useCallback, useContext, useState } from "react";
import DateTimePicker from "../components/DateTimePicker";
import CartContext from "../context/CartContext";

const Cart = () => {
  const imageDirectory = "http://45.74.32.213:4000/images/";

  const {
    cart,
    removeFromCartContext,
    selectedDateTimes,
    setSelectedDateTimes,
    fetchBusyTimes,
  } = useContext(CartContext);

  var [address, setAddress] = useState("");
  // var [addressValid, setAddressValid] = useState(true);
  var [addressSuggestions, setAddressSuggestions] = useState([]);
  const [bookingResponse, setBookingResponse] = useState(null);

  async function createCalendarEvent() {
    setBookingResponse("");
    let answeredQuestions = "";
    let summary = "";
    let description = "";
    cart.services.forEach((service) => {
      service.answeredQuestions.forEach((answeredQuestion) => {
        answeredQuestions += `${answeredQuestion.question}: ${answeredQuestion.answer}\nCost Increase: $${answeredQuestion.costIncrease}\n`;
      });
      summary += `${service.title}: $${service.price} `;
      description += `${service.title}: $${service.price}\n${answeredQuestions}\n`;
    });
    var startTime =
      selectedDateTimes.length > 0 ? selectedDateTimes[0].dateTime : null;
    var endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 5);
    console.log(startTime, endTime);
    console.log("summary:" + summary);
    console.log("description:" + description);
    try {
      const response = await axios.post(
        "/Calendar",
        {
          summary: summary,
          location: address,
          description: description,
          startTime: startTime,
          endTime: endTime,
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        const data = response.data;
        console.log("Calendar event created successfully:", data);
        if (data === "User is busy") {
          setBookingResponse(
            "Booking Complete. There is already an event in your calendar for this time."
          );
        }
        if (data === "Ramsays Detailing is busy") {
          setBookingResponse("Booking Failed. Pick another day or time.");
        }
        if (data === "Events created in calendar") {
          setBookingResponse("Booking Complete. Check your Google Calendar.");
        }
        fetchBusyTimes();
      } else {
        console.error("Failed to create calendar event:", response.status);
        setBookingResponse("Booking Failed: " + response.data);
      }
    } catch (error) {
      console.error("Error occurred while creating calendar event:", error);
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion);
    setAddressSuggestions([]);
  };

  const handleAddressSuggestions = useCallback(async (e) => {
    const inputAddress = e.target.value;
    setAddress(inputAddress);

    if (inputAddress.trim() === "") {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `http://45.74.32.213:4000/places/autocomplete?input=${encodeURIComponent(
          inputAddress
        )}`
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
    // setAddressValid(isValid);
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

  async function removeFromCart(service, index) {
    try {
      removeFromCartContext(service);
      var dateTimes = selectedDateTimes;
      const datePreviouslySelected = dateTimes.findIndex(
        (selectedDateTime) => selectedDateTime.id === index
      );
      if (datePreviouslySelected) {
        dateTimes.splice(datePreviouslySelected, 1);
        setSelectedDateTimes(dateTimes);
      }
    } catch (error) {
      console.log(error);
    }
  }

  try {
    if (cart.services.length > 0) {
      return (
        <div className="mx-10 flex flex-col items-center justify-center gap-10 py-10 xl:flex-row">
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
                    <DateTimePicker service={service} index={index} />
                    <button
                      onClick={() => removeFromCart(service, index)}
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
            <div className="flex flex-col items-center md:flex-row md:gap-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter address"
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
            </div>

            <div className="mt-5 flex flex-row">
              <h1 key="price">Total Cost: $</h1>
              <h1 className="font-sans">{cart.price}</h1>
            </div>
            <button
              className="button mt-3 bg-ramsayBlue-0 transition-all duration-500 hover:bg-blue-800"
              onClick={createCalendarEvent}
            >
              Book Detailing
            </button>
            <p>{bookingResponse}</p>
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
