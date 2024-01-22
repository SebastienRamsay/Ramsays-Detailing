import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AuthContext from "./AuthContext";
import toast from "react-hot-toast";

const BookingsContext = createContext();

function BookingsContextProvider(props) {
  const [bookings, setBookings] = useState([]);
  const [claimedBookings, setClaimedBookings] = useState([]);
  const { loggedIn, isAdmin, isEmployee } = useContext(AuthContext);

  async function fetchBookings() {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/bookings",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setBookings(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }

  async function fetchEmployeeBookings() {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/bookings/employee",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setBookings(response.data.bookings);
      setClaimedBookings(response.data.claimedBookings);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }

  const claimBooking = async (booking) => {
    const idResponse = await axios.patch(
      "https://ramsaysdetailing.ca:4000/api/bookings/claimBooking",
      {
        bookingId: booking._id,
      },
      {
        withCredentials: true, // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const employeeId = idResponse.data;
    if (idResponse.status === 200) {
      toast.success("Booking Claimed");
      var newBookings = bookings.filter((b) => b._id !== booking._id);
      var newClaimedBookings = claimedBookings;
      booking.employeeId = employeeId;
      newClaimedBookings.push(booking);
      setBookings(newBookings);
      setClaimedBookings(newClaimedBookings);
    }
  };

  const unClaimBooking = async (booking) => {
    if (booking.employeeEventId !== "none") {
      await removeBookingFromEmployeeCalendar(booking);
    }
    const idResponse = await axios.patch(
      "https://ramsaysdetailing.ca:4000/api/bookings/unClaimBooking",
      {
        bookingId: booking._id,
      },
      {
        withCredentials: true, // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (idResponse.status === 200) {
      toast.success("Booking Un-Claimed");
      const newBookings = [...bookings]; // Create a new array using spread operator
      const newClaimedBookings = claimedBookings.filter(
        (b) => b._id !== booking._id
      );
      booking.employeeId = "none";
      newBookings.push(booking);
      console.log(newBookings, newClaimedBookings);
      setBookings(newBookings);
      setClaimedBookings(newClaimedBookings);
    }
  };

  async function deleteBooking(booking, isEmployee) {
    console.log(booking, isEmployee);
    try {
      if (
        (booking.userEventId !== "none") |
        (booking.employeeEventId !== "none")
      ) {
        const calendarResponse = await axios.delete(
          "https://ramsaysdetailing.ca:4000/calendar/cancel",
          {
            withCredentials: true, // Include cookies in the request
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              employeeEventId: booking.employeeEventId,
              employeeId: booking.employeeId,
              userEventId: booking.userEventId,
              userId: booking.userId,
              bookingId: booking._id,
            },
          }
        );
        if (calendarResponse.status === 200) {
          toast.success("Booking Removed From Calendar");
        }
      }
      const bookingResponse = await axios.delete(
        "https://ramsaysdetailing.ca:4000/api/bookings",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            bookingId: booking._id,
            userId: booking.userId,
            employeeId: booking.employeeId,
          },
        }
      );
      if (bookingResponse.status === 200) {
        toast.success("Booking Deleted");
        var newBookings = bookings.filter((b) => b._id !== booking._id);
        var newClaimedBookings = claimedBookings.filter(
          (b) => b._id !== booking._id
        );
        console.log(newBookings);
        console.log(newClaimedBookings);
        setBookings(newBookings);
        setClaimedBookings(newClaimedBookings);
      }
    } catch (error) {
      console.log("Error when deleting event: " + error);
      toast.error("Error when canceling booking");
    }
  }

  async function addBookingToUserCalendar(booking) {
    const calendarResponse = await axios.post(
      "https://ramsaysdetailing.ca:4000/calendar",
      {
        cart: booking.cart,
        selectedDateTime: booking.date,
      },
      {
        withCredentials: true, // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const calendarData = await calendarResponse.data;
    if (calendarData === "User is busy") {
      return;
    }

    if (calendarResponse.status === 200) {
      toast.success("Booking Added To Calendar");
      const idResponse = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/bookings/setUserEventID",
        {
          userEventId: calendarData,
          bookingId: booking._id,
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (idResponse.status === 200) {
        var newBookings = [];
        newBookings = bookings.filter((b) => b._id !== booking._id);
        booking.userEventId = calendarData;
        newBookings.push(booking);
        console.log(newBookings);
        setBookings(newBookings);
      }
    }
  }

  async function removeBookingFromUserCalendar(booking) {
    console.log(booking.userEventId);
    const calendarResponse = await axios.delete(
      "https://ramsaysdetailing.ca:4000/calendar",
      {
        params: {
          eventId: booking.userEventId,
        },
        withCredentials: true, // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (calendarResponse.status === 200) {
      toast.success("Booking Removed from Calendar");
      const idResponse = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/bookings/setUserEventID",
        {
          userEventId: "none",
          bookingId: booking._id,
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (idResponse.status === 200) {
        var newBookings = [];
        newBookings = bookings.filter((b) => b._id !== booking._id);
        booking.userEventId = "none";
        newBookings.push(booking);
        console.log(newBookings);
        setBookings(newBookings);
      }
    }
  }

  async function removeBookingFromEmployeeCalendar(booking) {
    console.log(booking.userEventId);
    const calendarResponse = await axios.delete(
      "https://ramsaysdetailing.ca:4000/calendar",
      {
        params: {
          eventId: booking.employeeEventId,
        },
        withCredentials: true, // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const calendarData = await calendarResponse.data;
    if (calendarData === "User is busy") {
      return;
    }
    if (calendarResponse.status === 200) {
      toast.success("Booking Removed From Calendar");
      const idResponse = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/bookings/setEmployeeEventID",
        {
          employeeEventId: "none",
          bookingId: booking._id,
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (idResponse.status === 200) {
        var newClaimedBookings = [];
        newClaimedBookings = claimedBookings.filter(
          (b) => b._id !== booking._id
        );
        booking.employeeEventId = "none";
        newClaimedBookings.push(booking);
        console.log(booking);
        setClaimedBookings(newClaimedBookings);
      }
    }
  }

  async function addBookingToEmployeeCalendar(booking) {
    const calendarResponse = await axios.post(
      "https://ramsaysdetailing.ca:4000/calendar",
      {
        cart: booking.cart,
        selectedDateTime: booking.date,
      },
      {
        withCredentials: true, // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const calendarData = await calendarResponse.data;
    if (calendarData === "User is busy") {
      return;
    }
    if (calendarResponse.status === 200) {
      toast.success("Booking Added To Calendar");
      const idResponse = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/bookings/setEmployeeEventID",
        {
          employeeEventId: calendarData,
          bookingId: booking._id,
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (idResponse.status === 200) {
        var newClaimedBookings = [];
        newClaimedBookings = claimedBookings.filter(
          (b) => b._id !== booking._id
        );
        booking.employeeEventId = calendarData;
        newClaimedBookings.push(booking);
        console.log(booking);
        setClaimedBookings(newClaimedBookings);
      }
    }
  }

  var isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current && loggedIn !== undefined) {
      // Run this block only when the component is mounted for the first time
      if (isEmployee || isAdmin) {
        fetchEmployeeBookings();
      } else if (loggedIn) {
        fetchBookings();
      }
      isMounted.current = true;
    }
  }, [loggedIn, isAdmin, isEmployee]);

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        claimedBookings,
        setClaimedBookings,
        unClaimBooking,
        claimBooking,
        setBookings,
        fetchBookings,
        deleteBooking,
        addBookingToUserCalendar,
        removeBookingFromUserCalendar,
        removeBookingFromEmployeeCalendar,
        addBookingToEmployeeCalendar,
      }}
    >
      {props.children}
    </BookingsContext.Provider>
  );
}

export default BookingsContext;

export { BookingsContextProvider };
