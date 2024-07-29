import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import AuthContext from "./AuthContext";
const { DateTime } = require("luxon");

const BookingsContext = createContext();

function BookingsContextProvider(props) {
  const [bookings, setBookings] = useState({});
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

  async function fetchAdminBookings() {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/bookings/admin/info",
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
      if (response.status === 200) {
        setBookings({
          unClaimedBookings: response.data.unClaimedBookings,
          claimedBookings: response.data.claimedBookings,
          completeBookings: response.data.completeBookings,
          confirmedBookings: response.data.confirmedBookings,
        });
        console.log(response.data);
      } else {
        console.log(response.data);
        console.log("Error Fetching Booking Data");
      }
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
      var newBookings = bookings.unClaimedBookings.filter(
        (b) => b._id !== booking._id
      );
      var newClaimedBookings = bookings.claimedBookings;
      booking.employeeId = employeeId;
      newClaimedBookings.push(booking);
      setBookings((prevBookings) => ({
        ...prevBookings,
        claimedBookings: newClaimedBookings,
        unClaimedBookings: newBookings,
      }));
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
      const newBookings = [...bookings.unClaimedBookings]; // Create a new array using spread operator
      const newClaimedBookings = bookings.claimedBookings.filter(
        (b) => b._id !== booking._id
      );
      booking.employeeId = "none";
      newBookings.push(booking);
      console.log(newBookings, newClaimedBookings);
      setBookings((prevBookings) => ({
        ...prevBookings,
        unClaimedBookings: newBookings,
        claimedBookings: newClaimedBookings,
      }));
    }
  };

  const markBookingComplete = async (booking) => {
    if (!booking?.beforePictures || booking.beforePictures.length < 3) {
      toast.error("Please upload 4 or more before pictures");
      return;
    }
    if (!booking?.afterPictures || booking.afterPictures.length < 3) {
      toast.error("Please upload 4 or more after pictures");
      return;
    }
    const bookingCompleteResponse = await axios.post(
      "https://ramsaysdetailing.ca:4000/api/bookings/markBookingComplete",
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
    if (bookingCompleteResponse.status === 200) {
      toast.success("Booking Marked Complete");
      const newBooking = { ...booking, status: "Complete" };
      setBookings((prevBookings) => ({
        ...prevBookings,
        claimedBookings: prevBookings.claimedBookings.filter(
          (b) => b.id === booking._id
        ),
        completeBookings: [...prevBookings.completeBookings, newBooking],
      }));
    }
  };

  const payoutEmployee = async (booking) => {
    if (booking?.status !== "Complete") {
      toast.error("Booking Not Complete");
      return;
    }
    // if (!isAdmin) {
    //   toast.error("NOT AN ADMIN");
    //   return;
    // }
    const bookingCompleteResponse = await axios.post(
      "https://ramsaysdetailing.ca:4000/api/stripe/payoutEmployee",
      {
        bookingId: booking._id,
        comment: booking.comment,
        rating: booking.rating,
      },
      {
        withCredentials: true, // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (bookingCompleteResponse.status === 200) {
      toast.success("Booking Marked Confirmed");
      const newBooking = { ...booking, status: "Confirmed" };
      if (isAdmin) {
        setBookings((prevBookings) => ({
          ...prevBookings,
          completeBookings: prevBookings.completeBookings.filter(
            (b) => b.id === booking._id
          ),
          confirmedBookings: [...prevBookings.confirmedBookings, newBooking],
        }));
      } else {
        setBookings((prevBookings) =>
          prevBookings.map((b) => (b._id === booking._id ? newBooking : b))
        );
      }
    }
  };

  async function deleteBooking(booking, isEmployee) {
    console.log(booking, isEmployee);
    if (isEmployee) {
      toast.error("Employees can't delete bookings");
      return;
    }
    if (
      booking.status !== "Un-Paid" &&
      DateTime.fromISO(booking.date).diff(DateTime.now(), "hours").hours < 48
    ) {
      toast.error("Can't refund bookings within 48 hours from now");
      return;
    }
    try {
      console.log(booking._id);
      const refundResponse = await axios.delete(
        "https://ramsaysdetailing.ca:4000/api/stripe/refundCheckoutSession",
        {
          data: { _id: booking._id }, // Pass data as the second argument
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (refundResponse.status === 200) {
        toast.success("Booking Refunded");
        if (
          (booking.userEventId !== "none") | // Calendar event exists
          (booking.employeeEventId !== "none")
        ) {
          const calendarResponse = await axios.delete(
            "https://ramsaysdetailing.ca:4000/calendar/cancel",
            {
              data: {
                employeeEventId: booking.employeeEventId,
                employeeId: booking.employeeId,
                userEventId: booking.userEventId,
                userId: booking.userId,
                bookingId: booking._id,
              },
            },
            {
              withCredentials: true, // Include cookies in the request
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (calendarResponse.status === 200) {
            toast.success("Booking Removed From Calendar");
          }
        }

        toast.success("Booking Deleted");
        if (isAdmin) {
          const newBookings = bookings.unClaimedBookings.filter(
            (b) => b._id !== booking._id
          );
          const newClaimedBookings = bookings.claimedBookings.filter(
            (b) => b._id !== booking._id
          );
          console.log(newBookings);
          console.log(newClaimedBookings);
          setBookings((prevBookings) => ({
            ...prevBookings,
            unClaimedBookings: newBookings,
            claimedBookings: newClaimedBookings,
          }));
        } else {
          const newBookings = bookings.filter((b) => b._id !== booking._id);
          setBookings(newBookings);
        }
      } else {
        console.log(refundResponse.data);
        toast.error("Failed To Cancel Booking");
        return;
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
      toast.error("User is busy");
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
        newBookings = bookings.unClaimedBookings.filter(
          (b) => b._id !== booking._id
        );
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
        newBookings = bookings.unClaimedBookings.filter(
          (b) => b._id !== booking._id
        );
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
        newClaimedBookings = bookings.claimedBookings.filter(
          (b) => b._id !== booking._id
        );
        booking.employeeEventId = "none";
        newClaimedBookings.push(booking);
        console.log(booking);
        setBookings((prevBookings) => ({
          ...prevBookings,
          claimedBookings: newClaimedBookings,
        }));
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
        newClaimedBookings = bookings.claimedBookings.filter(
          (b) => b._id !== booking._id
        );
        booking.employeeEventId = calendarData;
        newClaimedBookings.push(booking);
        console.log(booking);
        setBookings((prevBookings) => ({
          ...prevBookings,
          claimedBookings: newClaimedBookings,
        }));
      }
    }
  }

  async function rescheduleBooking(booking, dateTime) {
    try {
      const response = await axios.patch(
        "https://ramsaysdetailing.ca:4000/api/bookings/reScheduleBooking",
        {
          dateTime,
          bookingId: booking._id,
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("booking re-scheduled");
      }
    } catch (error) {
      console.log(error);
    }
  }

  var isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current && loggedIn !== undefined) {
      // Run this block only when the component is mounted for the first time
      if (isAdmin) {
        fetchAdminBookings();
      } else if (isEmployee) {
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
        fetchAdminBookings,
        unClaimBooking,
        claimBooking,
        setBookings,
        fetchBookings,
        deleteBooking,
        addBookingToUserCalendar,
        removeBookingFromUserCalendar,
        removeBookingFromEmployeeCalendar,
        addBookingToEmployeeCalendar,
        markBookingComplete,
        payoutEmployee,
        rescheduleBooking,
      }}
    >
      {props.children}
    </BookingsContext.Provider>
  );
}

export default BookingsContext;

export { BookingsContextProvider };
