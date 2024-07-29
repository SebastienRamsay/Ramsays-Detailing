import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import EmployeeRatingPopup from "../components/EmployeeRatingPopup";
import ReScheduleBookingPopup from "../components/ReScheduleBookingPopup";
import RefundBookingPopup from "../components/RefundBookingPopup";
import AuthContext from "../context/AuthContext";
import BookingsContext from "../context/BookingsContext";
import CartContext from "../context/CartContext";
import PopupContext from "../context/PopupContext";
const { DateTime } = require("luxon");

const Bookings = () => {
  const stripePromise = loadStripe(
    "pk_test_51NKxGTDXNQXcJQtnMzzJXLcE04Xi9B5eRt2koClKaWBUjJ7PZk9izcjtbkL57emaTo8GQBmHSOwwmTuqqp2pmsxX00Vhvkda9F"
  );
  const navigate = useNavigate();
  const {
    bookings,
    setBookings,
    addBookingToUserCalendar,
    removeBookingFromUserCalendar,
    removeBookingFromEmployeeCalendar,
    addBookingToEmployeeCalendar,
    unClaimBooking,
    claimBooking,
    fetchBookings,
    markBookingComplete,
    payoutEmployee,
  } = useContext(BookingsContext);
  const { isAdmin, isEmployee } = useContext(AuthContext);
  const {
    setRefundBookingPopupOpen,
    setBookingToRefund,
    setBookingToMarkConfirmed,
    setEmployeeRatingPopupOpen,
    setReScheduleBookingPopupOpen,
    setBookingToReSchedule,
  } = useContext(PopupContext);
  const { cart, clearCartContext, fetchBusyTimesForReSchedule } =
    useContext(CartContext);
  const [showConfirmedBookings, setShowConfirmedBookings] = useState(false);
  const [showCompleteBookings, setShowCompleteBookings] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [showClaimedBookings, setShowClaimedBookings] = useState(false);
  console.log(bookings);
  const imageDirectory = "https://ramsaysdetailing.ca:4000/images/";

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;

    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      async function paymentSuccess() {
        await fetchBookings();
        await clearCartContext();
        console.log("Payment Complete", cart);
        toast.success("Payment Complete");
      }
      paymentSuccess();
    }
    if (query.get("failed")) {
      async function paymentFailed() {
        await fetchBookings();
        toast.error("Payment Failed, Please Try Again Or Cancel The Booking");
      }
      paymentFailed();
    }
    setTimeout(() => {
      // Navigate to /bookings after 5 seconds
      navigate("/bookings");
    }, 5000); // 5000 milliseconds = 5 seconds
    hasRunRef.current = true;
  }, [cart, clearCartContext, fetchBookings, bookings, navigate]);

  function formatDate(dateToFormat) {
    const date = new Date(dateToFormat);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    };

    return date.toLocaleString("en-US", options);
  }

  const deleteBefore = async ({ claimedBooking, pic }) => {
    console.log(pic, claimedBooking);
    try {
      const response = await axios.delete(
        "https://ramsaysdetailing.ca:4000/upload/before?imageName=" +
          pic +
          "&bookingID=" +
          claimedBooking._id,
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("picture removed");
        setBookings((prevBookings) => ({
          ...prevBookings,
          claimedBookings: prevBookings.claimedBookings.map((booking) => ({
            ...booking,
            beforePictures:
              booking._id === claimedBooking._id
                ? claimedBooking.beforePictures.filter((file) => file !== pic)
                : booking.beforePictures,
          })),
        }));
      }
    } catch (error) {
      console.error("Error deleting files", error);
    }
  };

  const deleteAfter = async ({ claimedBooking, pic }) => {
    console.log(pic, claimedBooking);
    try {
      const response = await axios.delete(
        "https://ramsaysdetailing.ca:4000/upload/after?imageName=" +
          pic +
          "&bookingID=" +
          claimedBooking._id,
        {
          withCredentials: true, // Include cookies in the request
        }
      );
      if (response.status === 200) {
        toast.success("picture removed");
        setBookings((prevBookings) => ({
          ...prevBookings,
          claimedBookings: prevBookings.claimedBookings.map((booking) => ({
            ...booking,
            afterPictures:
              booking._id === claimedBooking._id
                ? claimedBooking.afterPictures.filter((file) => file !== pic)
                : booking.afterPictures,
          })),
        }));
      }
    } catch (error) {
      console.error("Error deleting files", error);
    }
  };

  const submitBefore = async ({ event, claimedBooking }) => {
    const files = Array.from(event.target.files);

    const formData = new FormData();

    files &&
      files.forEach((file) => {
        // Append files directly to the formData object
        formData.append("images", file);
      });

    try {
      const response = await axios.post(
        `https://ramsaysdetailing.ca:4000/upload/before?bookingID=${claimedBooking._id}`,
        formData,
        {
          withCredentials: true, // Include cookies in the request
        }
      );

      if (response.status === 200) {
        toast.success("picture(s) uploaded");
        const data = response.data;
        setBookings((prevBookings) => ({
          ...prevBookings,
          claimedBookings: prevBookings.claimedBookings.map((booking) =>
            booking._id === claimedBooking._id
              ? { ...booking, beforePictures: data.imageNames }
              : { ...booking }
          ),
        }));
      } else {
        console.error(response.data);
      }
    } catch (error) {
      console.error("Error uploading files", error);
    }
  };

  const submitAfter = async ({ event, claimedBooking }) => {
    const files = Array.from(event.target.files);

    // setBookings((prevBookings) => ({
    //   ...prevBookings,
    //   claimedBookings: prevBookings.claimedBookings.map((booking) =>
    //     booking._id === claimedBooking._id
    //       ? { ...booking, afterFiles: files }
    //       : { ...booking }
    //   ),
    // }));

    const formData = new FormData();

    files &&
      files.forEach((file) => {
        formData.append(`images`, file);
      });
    try {
      const response = await axios.post(
        "https://ramsaysdetailing.ca:4000/upload/after?bookingID=" +
          claimedBooking._id,
        formData,
        {
          withCredentials: true, // Include cookies in the request
        }
      );

      if (response.status === 200) {
        toast.success("picture(s) uploaded");
        const data = await response.data;
        setBookings((prevBookings) => ({
          ...prevBookings,
          claimedBookings: prevBookings.claimedBookings.map((booking) =>
            booking._id === claimedBooking._id
              ? { ...booking, afterPictures: data.imageNames }
              : { ...booking }
          ),
        }));
      } else {
        console.error(response.data);
      }
    } catch (error) {
      console.error("Error uploading files", error);
    }
  };

  const retryPayment = async (booking) => {
    try {
      var cart = {};
      cart.date = booking.date;
      cart.services = booking.services;
      const items = booking.services.map((service) => {
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
      console.log("test");
      try {
        const sessionResponse = await axios.post(
          "https://ramsaysdetailing.ca:4000/api/stripe/createCheckoutSession",
          {
            items,
            cart,
            bookingId: booking._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // Initiate Stripe Checkout session and get the session ID

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
        toast.error(error.response.data);
        console.error("Error initiating Checkout:", error.response.data);
      }
    } catch (error) {
      toast.error("Error initiating Checkout");
      console.error("Error initiating Checkout:", error.message);
    }
  };

  if (
    (bookings && bookings.length > 0) ||
    (bookings.unClaimedBookings && bookings.unClaimedBookings.length > 0) ||
    (bookings.claimedBookings && bookings.claimedBookings.length > 0) ||
    (bookings.completeBookings && bookings.completeBookings.length > 0) ||
    (bookings.confirmedBookings && bookings.confirmedBookings.length > 0)
  ) {
    if (isAdmin || isEmployee) {
      return (
        <div className="mx-3 flex flex-col items-center justify-center gap-10 py-10">
          {bookings?.unClaimedBookings &&
            bookings.unClaimedBookings.length > 0 && (
              <div className="rounded-lg bg-primary-0 p-8 pb-16 md:p-10">
                <div className="flex flex-row items-center justify-center">
                  <button
                    className="button bg-primary-700 hover:bg-primary-800 mt-3 items-center text-3xl transition-all duration-300"
                    onClick={() => setShowBookings(!showBookings)}
                  >
                    <b>{showBookings ? "^" : "⌄"}</b>
                  </button>
                  <h1 className="text-2xl font-bold">Un-Claimed Bookings</h1>
                </div>
                <div
                  className={
                    "grid gap-10 text-center " +
                    (bookings.unClaimedBookings.length > 2
                      ? "2xl:grid-cols-3 "
                      : " ") +
                    (bookings.unClaimedBookings.length > 1
                      ? "md:grid-cols-2 "
                      : " ")
                  }
                >
                  {bookings &&
                    showBookings &&
                    bookings.unClaimedBookings.map((booking, index) => (
                      <div
                        key={`${booking._id}-${index}`}
                        className="flex flex-col gap-2 border bg-secondary-0 p-3 font-bold"
                      >
                        {booking.services &&
                          booking.services.map((service, index) => (
                            <div key={`${service._id}-${index}`} className="">
                              <img
                                src={imageDirectory + service.localImageName}
                                alt={service.title + " Image"}
                                className="w-[500px]"
                              />
                              <h1 className="title mb-3 text-lg lg:text-xl">
                                {service.title}: ${service.price}
                              </h1>
                              <h1>
                                Time To Complete Service:{" "}
                                {service.timeToComplete} Hours
                              </h1>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Question</th>
                                    <th>Answer</th>
                                    <th>Cost Increase</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {service.answeredQuestions.map(
                                    (answeredQuestion, qIndex) => (
                                      <tr
                                        key={`${answeredQuestion._id}-${qIndex}`}
                                      >
                                        <td>{answeredQuestion.question}</td>
                                        <td>{answeredQuestion.answer}</td>
                                        <td>{answeredQuestion.costIncrease}</td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        <h1>
                          Expected Time To Complete:{" "}
                          {booking.expectedTimeToComplete} Hours
                        </h1>
                        <h1>
                          Earnings:{" $"}
                          {booking.expectedTimeToComplete * 20}
                        </h1>
                        <h1>Client Name: {booking.name}</h1>
                        <h1>Client Phone Number: {booking.phoneNumber}</h1>
                        <h1>
                          Booking Date and Time: {formatDate(booking.date)}
                        </h1>
                        <button
                          className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                          onClick={async () => {
                            await claimBooking(booking);
                          }}
                        >
                          Claim Booking
                        </button>
                        {isAdmin ? (
                          <>
                            <button
                              className="button mt-3 bg-ramsayBlue-0 transition-all duration-300 hover:bg-blue-800"
                              onClick={async () => {
                                setBookingToRefund(booking);
                                setRefundBookingPopupOpen(true);
                              }}
                            >
                              Cancel Booking
                            </button>
                            <RefundBookingPopup />
                          </>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            )}
          {bookings?.claimedBookings && bookings.claimedBookings.length > 0 && (
            <div className="rounded-lg bg-primary-0 p-8 pb-16 text-center md:p-10">
              <div className="flex flex-row items-center justify-center">
                <button
                  className="button bg-primary-700 hover:bg-primary-800 mt-3 items-center text-3xl transition-all duration-300"
                  onClick={() => setShowClaimedBookings(!showClaimedBookings)}
                >
                  <b>{showClaimedBookings ? "^" : "⌄"}</b>
                </button>
                <h1 className="text-2xl font-bold">Claimed Bookings</h1>
              </div>
              <div
                className={
                  "grid gap-10 text-center " +
                  (bookings.claimedBookings.length > 2
                    ? "2xl:grid-cols-3 "
                    : " ") +
                  (bookings.claimedBookings.length > 1
                    ? "md:grid-cols-2 "
                    : " ")
                }
              >
                {bookings.claimedBookings &&
                  showClaimedBookings &&
                  bookings.claimedBookings.map((claimedBooking, index) => (
                    <div
                      key={`claimed-${claimedBooking._id}-${index}`}
                      className="flex flex-col gap-3 border bg-secondary-0 p-3 font-bold"
                    >
                      {claimedBooking.services &&
                        claimedBooking.services.map((service, index) => (
                          <div key={`${service._id}-${index}`} className="">
                            <img
                              src={imageDirectory + service.localImageName}
                              alt={service.title + " Image"}
                              className="w-[500px]"
                            />
                            <h1 className="title mb-3 text-lg lg:text-xl">
                              {service.title}: ${service.price}
                            </h1>
                            <h1>
                              Time To Complete Service: {service.timeToComplete}{" "}
                              Hours
                            </h1>
                            <table>
                              <thead>
                                <tr>
                                  <th>Question</th>
                                  <th>Answer</th>
                                  <th>Cost Increase</th>
                                </tr>
                              </thead>
                              <tbody>
                                {service.answeredQuestions.map(
                                  (answeredQuestion, qIndex) => (
                                    <tr
                                      key={`${answeredQuestion._id}-${qIndex}`}
                                    >
                                      <td>{answeredQuestion.question}</td>
                                      <td>{answeredQuestion.answer}</td>
                                      <td>{answeredQuestion.costIncrease}</td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      <h1>
                        Expected Time To Complete:{" "}
                        {claimedBooking.expectedTimeToComplete} Hours
                      </h1>
                      <h1>
                        Earnings:{" $"}
                        {claimedBooking.expectedTimeToComplete * 20}
                      </h1>
                      <h1>Client Name: {claimedBooking.name}</h1>
                      <h1>Client Phone Number: {claimedBooking.phoneNumber}</h1>
                      <h1>
                        Booking Date and Time: {formatDate(claimedBooking.date)}
                      </h1>
                      <button
                        className="button mt-3 bg-red-700 transition-all duration-300 hover:bg-red-800"
                        onClick={async () => {
                          await unClaimBooking(claimedBooking);
                        }}
                      >
                        Un-Claim Booking
                      </button>
                      {claimedBooking.employeeEventId === "none" && (
                        <button
                          className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                          onClick={async () => {
                            await addBookingToEmployeeCalendar(claimedBooking);
                          }}
                        >
                          Add To Calendar
                        </button>
                      )}
                      {claimedBooking.employeeEventId !== "none" && (
                        <button
                          className="button mt-3 bg-red-700 transition-all duration-300 hover:bg-red-800"
                          onClick={async () => {
                            await removeBookingFromEmployeeCalendar(
                              claimedBooking
                            );
                          }}
                        >
                          Remove From Calendar
                        </button>
                      )}
                      <div className="my-2 flex flex-col gap-1">
                        <h1>Navigate:</h1>
                        <button
                          className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                          onClick={async () => {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                claimedBooking.location
                              )}`,
                              "_blank"
                            );
                          }}
                        >
                          Google Maps
                        </button>
                        <button
                          className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                          onClick={async () => {
                            window.open(
                              `https://waze.com/ul?ll=${encodeURIComponent(
                                claimedBooking.location
                              )}&navigate=yes`,
                              "_blank"
                            );
                          }}
                        >
                          Waze
                        </button>
                      </div>
                      <div>
                        <div className="relative p-2">
                          <input
                            type="file"
                            id={claimedBooking._id + "beforeImageInput"}
                            className="sr-only"
                            accept="image/*"
                            multiple
                            onChange={async (event) => {
                              submitBefore({ event, claimedBooking });
                            }}
                          />
                          <label
                            htmlFor={claimedBooking._id + "beforeImageInput"}
                            className="cursor-pointer rounded-lg bg-ramsayBlue-0 px-4 py-2 text-white shadow-md transition-all duration-300 hover:bg-blue-800"
                          >
                            Upload Before Images
                          </label>
                        </div>
                        {claimedBooking?.beforePictures.length > 0 && (
                          <div>
                            <button
                              className="button bg-primary-700 hover:bg-primary-800 mt-3 transition-all duration-300"
                              onClick={() => {
                                setBookings((prevBookings) => ({
                                  ...prevBookings,
                                  claimedBookings:
                                    prevBookings.claimedBookings.map(
                                      (booking) =>
                                        booking._id === claimedBooking._id
                                          ? {
                                              ...booking,
                                              beforeImagesCollapsed:
                                                !claimedBooking.beforeImagesCollapsed ||
                                                false,
                                            }
                                          : booking
                                    ),
                                }));
                              }}
                            >
                              {!claimedBooking?.beforeImagesCollapsed
                                ? "Expand"
                                : "Collapse"}{" "}
                              Before Images
                            </button>
                            {claimedBooking?.beforeImagesCollapsed &&
                              claimedBooking.beforePictures && (
                                <div>
                                  {claimedBooking.beforePictures.map(
                                    (pic, index) => (
                                      <div key={index} className="relative">
                                        <button
                                          onClick={() =>
                                            deleteBefore({
                                              claimedBooking,
                                              pic,
                                            })
                                          }
                                          className="absolute right-12 top-2 rounded-full bg-red-700 px-3 py-1 text-xl font-bold transition-all duration-300 hover:bg-red-800"
                                        >
                                          <b>X</b>
                                        </button>
                                        <img
                                          src={
                                            "https://ramsaysdetailing.ca:4000/images/" +
                                            claimedBooking._id +
                                            "/" +
                                            pic
                                          }
                                          alt={index}
                                          className="w-[500px]"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="relative p-2">
                          <input
                            type="file"
                            id={claimedBooking._id + "afterImageInput"}
                            className="sr-only"
                            accept="image/*"
                            multiple
                            onChange={async (event) => {
                              submitAfter({ event, claimedBooking });
                            }}
                          />
                          <label
                            htmlFor={claimedBooking._id + "afterImageInput"}
                            className="cursor-pointer rounded-lg bg-ramsayBlue-0 px-4 py-2 text-white shadow-md transition-all duration-300 hover:bg-blue-800"
                          >
                            Upload After Images
                          </label>
                        </div>
                        {claimedBooking?.afterPictures.length > 0 && (
                          <div>
                            <button
                              className="button bg-primary-700 hover:bg-primary-800 mt-3 transition-all duration-300"
                              onClick={() => {
                                setBookings((prevBookings) => ({
                                  ...prevBookings,
                                  claimedBookings:
                                    prevBookings.claimedBookings.map(
                                      (booking) =>
                                        booking._id === claimedBooking._id
                                          ? {
                                              ...booking,
                                              afterImagesCollapsed:
                                                !claimedBooking.afterImagesCollapsed ||
                                                false,
                                            }
                                          : booking
                                    ),
                                }));
                              }}
                            >
                              {!claimedBooking?.afterImagesCollapsed
                                ? "Expand"
                                : "Collapse"}{" "}
                              After Images
                            </button>
                            {claimedBooking?.afterImagesCollapsed &&
                              claimedBooking.afterPictures && (
                                <div>
                                  {claimedBooking.afterPictures.map(
                                    (pic, index) => (
                                      <div key={index} className="relative">
                                        <button
                                          onClick={() =>
                                            deleteAfter({
                                              claimedBooking,
                                              pic,
                                            })
                                          }
                                          className="absolute right-12 top-2 rounded-full bg-red-700 px-3 py-1 text-xl font-bold transition-all duration-300 hover:bg-red-800"
                                        >
                                          <b>X</b>
                                        </button>
                                        <img
                                          src={
                                            "https://ramsaysdetailing.ca:4000/images/" +
                                            claimedBooking._id +
                                            "/" +
                                            pic
                                          }
                                          alt={index}
                                          className="w-[500px]"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                      <button
                        className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                        onClick={async () => {
                          await markBookingComplete(claimedBooking);
                        }}
                      >
                        Mark Complete
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {bookings?.completeBookings &&
            bookings.completeBookings.length > 0 && (
              <div className="rounded-lg bg-primary-0 p-8 pb-16 text-center md:p-10">
                <div className="flex flex-row items-center justify-center">
                  <button
                    className="button bg-primary-700 hover:bg-primary-800 mt-3 items-center text-3xl transition-all duration-300"
                    onClick={() =>
                      setShowCompleteBookings(!showCompleteBookings)
                    }
                  >
                    <b>{showCompleteBookings ? "^" : "⌄"}</b>
                  </button>
                  <h1 className="text-2xl font-bold">Complete Bookings</h1>
                </div>
                <div
                  className={
                    "grid justify-center gap-10 " +
                    (bookings.completeBookings.length > 2
                      ? "2xl:grid-cols-3 "
                      : " ") +
                    (bookings.completeBookings.length > 1
                      ? "md:grid-cols-2 "
                      : " ")
                  }
                >
                  {bookings.completeBookings &&
                    showCompleteBookings &&
                    bookings.completeBookings.map((completeBooking, index) => (
                      <div
                        key={`claimed-${completeBooking._id}-${index}`}
                        className="flex flex-col gap-3 border bg-secondary-0 p-3 font-bold"
                      >
                        {completeBooking.services &&
                          completeBooking.services.map((service, index) => (
                            <div key={`${service._id}-${index}`} className="">
                              <img
                                src={imageDirectory + service.localImageName}
                                alt={service.title + " Image"}
                                className="w-[500px]"
                              />
                              <h1 className="title mb-3 text-lg lg:text-xl">
                                {service.title}: ${service.price}
                              </h1>
                              <h1>
                                Time To Complete Service:{" "}
                                {service.timeToComplete} Hours
                              </h1>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Question</th>
                                    <th>Answer</th>
                                    <th>Cost Increase</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {service.answeredQuestions.map(
                                    (answeredQuestion, qIndex) => (
                                      <tr
                                        key={`${answeredQuestion._id}-${qIndex}`}
                                      >
                                        <td>{answeredQuestion.question}</td>
                                        <td>{answeredQuestion.answer}</td>
                                        <td>{answeredQuestion.costIncrease}</td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        <h1>
                          Expected Time To Complete:{" "}
                          {completeBooking.expectedTimeToComplete} Hours
                        </h1>
                        <h1>
                          Earnings:{" $"}
                          {completeBooking.expectedTimeToComplete * 20}
                        </h1>
                        <h1>Client Name: {completeBooking.name}</h1>
                        <h1>
                          Client Phone Number: {completeBooking.phoneNumber}
                        </h1>
                        <h1>
                          Booking Date and Time:{" "}
                          {formatDate(completeBooking.date)}
                        </h1>
                        <div>
                          <button
                            className="button bg-primary-700 hover:bg-primary-800 mt-3 transition-all duration-300"
                            onClick={() => {
                              setBookings((prevBookings) => ({
                                ...prevBookings,
                                completeBookings:
                                  prevBookings.completeBookings.map((booking) =>
                                    booking._id === completeBooking._id
                                      ? {
                                          ...booking,
                                          beforeImagesCollapsed:
                                            !completeBooking.beforeImagesCollapsed ||
                                            false,
                                        }
                                      : booking
                                  ),
                              }));
                            }}
                          >
                            {!completeBooking?.beforeImagesCollapsed
                              ? "Expand"
                              : "Collapse"}{" "}
                            Before Images
                          </button>
                          {completeBooking?.beforeImagesCollapsed &&
                            completeBooking.beforePictures && (
                              <div>
                                {completeBooking.beforePictures.map(
                                  (pic, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={
                                          "https://ramsaysdetailing.ca:4000/images/" +
                                          completeBooking._id +
                                          "/" +
                                          pic
                                        }
                                        alt={index}
                                        className="w-[500px]"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                        <div>
                          <button
                            className="button bg-primary-700 hover:bg-primary-800 mt-3 transition-all duration-300"
                            onClick={() => {
                              setBookings((prevBookings) => ({
                                ...prevBookings,
                                completeBookings:
                                  prevBookings.completeBookings.map((booking) =>
                                    booking._id === completeBooking._id
                                      ? {
                                          ...booking,
                                          afterImagesCollapsed:
                                            !completeBooking.afterImagesCollapsed ||
                                            false,
                                        }
                                      : booking
                                  ),
                              }));
                            }}
                          >
                            {!completeBooking?.afterImagesCollapsed
                              ? "Expand"
                              : "Collapse"}{" "}
                            After Images
                          </button>
                          {completeBooking?.afterImagesCollapsed &&
                            completeBooking.afterPictures && (
                              <div>
                                {completeBooking.afterPictures.map(
                                  (pic, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={
                                          "https://ramsaysdetailing.ca:4000/images/" +
                                          completeBooking._id +
                                          "/" +
                                          pic
                                        }
                                        alt={index}
                                        className="w-[500px]"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                        {isAdmin ? (
                          <button
                            className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                            onClick={async () => {
                              await payoutEmployee(completeBooking);
                            }}
                          >
                            Mark Confirmed
                          </button>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            )}

          {bookings?.confirmedBookings &&
            bookings.confirmedBookings.length > 0 && (
              <div className="rounded-lg bg-primary-0 p-8 pb-16 text-center md:p-10">
                <div className="flex flex-row items-center justify-center">
                  <button
                    className="button bg-primary-700 hover:bg-primary-800 mt-3 items-center text-3xl transition-all duration-300"
                    onClick={() =>
                      setShowConfirmedBookings(!showConfirmedBookings)
                    }
                  >
                    <b>{showConfirmedBookings ? "^" : "⌄"}</b>
                  </button>
                  <h1 className="text-2xl font-bold">Confirmed Bookings</h1>
                </div>
                <div
                  className={
                    "grid justify-center gap-10 " +
                    (bookings.completeBookings.length > 2
                      ? "2xl:grid-cols-3 "
                      : " ") +
                    (bookings.completeBookings.length > 1
                      ? "md:grid-cols-2 "
                      : " ")
                  }
                >
                  {bookings.confirmedBookings &&
                    showConfirmedBookings &&
                    bookings.confirmedBookings.map(
                      (confirmedBooking, index) => (
                        <div
                          key={`claimed-${confirmedBooking._id}-${index}`}
                          className="flex flex-col gap-3 border bg-secondary-0 p-3 font-bold"
                        >
                          {confirmedBooking.services &&
                            confirmedBooking.services.map((service, index) => (
                              <div key={`${service._id}-${index}`} className="">
                                <img
                                  src={imageDirectory + service.localImageName}
                                  alt={service.title + " Image"}
                                  className="w-[500px]"
                                />
                                <h1 className="title mb-3 text-lg lg:text-xl">
                                  {service.title}: ${service.price}
                                </h1>
                                <h1>
                                  Time To Complete Service:{" "}
                                  {service.timeToComplete} Hours
                                </h1>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Question</th>
                                      <th>Answer</th>
                                      <th>Cost Increase</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {service.answeredQuestions.map(
                                      (answeredQuestion, qIndex) => (
                                        <tr
                                          key={`${answeredQuestion._id}-${qIndex}`}
                                        >
                                          <td>{answeredQuestion.question}</td>
                                          <td>{answeredQuestion.answer}</td>
                                          <td>
                                            {answeredQuestion.costIncrease}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          <h1>
                            Expected Time To Complete:{" "}
                            {confirmedBooking.expectedTimeToComplete} Hours
                          </h1>
                          <h1>
                            Earnings:{" $"}
                            {confirmedBooking.expectedTimeToComplete * 20}
                          </h1>
                          <h1>Client Name: {confirmedBooking.name}</h1>
                          <h1>
                            Client Phone Number: {confirmedBooking.phoneNumber}
                          </h1>
                          <h1>
                            Booking Date and Time:{" "}
                            {formatDate(confirmedBooking.date)}
                          </h1>
                          <div>
                            <button
                              className="button bg-primary-700 hover:bg-primary-800 mt-3 transition-all duration-300"
                              onClick={() => {
                                setBookings((prevBookings) => ({
                                  ...prevBookings,
                                  confirmedBookings:
                                    prevBookings.confirmedBookings.map(
                                      (booking) =>
                                        booking._id === confirmedBooking._id
                                          ? {
                                              ...booking,
                                              beforeImagesCollapsed:
                                                !confirmedBooking.beforeImagesCollapsed ||
                                                false,
                                            }
                                          : booking
                                    ),
                                }));
                              }}
                            >
                              {!confirmedBooking?.beforeImagesCollapsed
                                ? "Expand"
                                : "Collapse"}{" "}
                              Before Images
                            </button>
                            {confirmedBooking?.beforeImagesCollapsed &&
                              confirmedBooking.beforePictures && (
                                <div>
                                  {confirmedBooking.beforePictures.map(
                                    (pic, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={
                                            "https://ramsaysdetailing.ca:4000/images/" +
                                            confirmedBooking._id +
                                            "/" +
                                            pic
                                          }
                                          alt={index}
                                          className="w-[500px]"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                          <div>
                            <button
                              className="button bg-primary-700 hover:bg-primary-800 mt-3 transition-all duration-300"
                              onClick={() => {
                                setBookings((prevBookings) => ({
                                  ...prevBookings,
                                  confirmedBookings:
                                    prevBookings.confirmedBookings.map(
                                      (booking) =>
                                        booking._id === confirmedBooking._id
                                          ? {
                                              ...booking,
                                              afterImagesCollapsed:
                                                !confirmedBooking.afterImagesCollapsed ||
                                                false,
                                            }
                                          : booking
                                    ),
                                }));
                              }}
                            >
                              {!confirmedBooking?.afterImagesCollapsed
                                ? "Expand"
                                : "Collapse"}{" "}
                              After Images
                            </button>
                            {confirmedBooking?.afterImagesCollapsed &&
                              confirmedBooking.afterPictures && (
                                <div>
                                  {confirmedBooking.afterPictures.map(
                                    (pic, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={
                                            "https://ramsaysdetailing.ca:4000/images/" +
                                            confirmedBooking._id +
                                            "/" +
                                            pic
                                          }
                                          alt={index}
                                          className="w-[500px]"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}
        </div>
      );
    }
    return (
      <div className="mx-10 flex flex-col items-center justify-center gap-10 py-10">
        <div className="rounded-lg bg-primary-0 p-8 pb-16 text-center md:p-10">
          <h1 className="mb-3 text-2xl font-bold">Bookings</h1>
          <div
            className={
              "grid gap-10 " +
              (bookings.length > 2 ? "2xl:grid-cols-3 " : " ") +
              (bookings.length > 1 ? "md:grid-cols-2 " : " ")
            }
          >
            {bookings &&
              bookings.map((booking, index) => (
                <div
                  key={`${booking._id}-${index}`}
                  className="relative flex flex-col gap-2 border bg-secondary-0 p-3 pb-14 font-bold"
                >
                  {booking.services &&
                    booking.services.map((service, index) => (
                      <div key={service._id} className="">
                        <img
                          src={imageDirectory + service.localImageName}
                          alt={service.title + " Image"}
                          className="w-[500px]"
                        />
                        <h1 className="title mb-3 text-lg lg:text-xl">
                          {service.title}: ${service.price}
                        </h1>
                        <h1>
                          Time To Complete Service: {service.timeToComplete}{" "}
                          Hours
                        </h1>
                        {/* <thead>
                      <tr>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Cost Increase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service.answeredQuestions.map(
                        (answeredQuestion, qIndex) => (
                          <tr key={`${answeredQuestion._id}-${qIndex}`}>
                            <td>{answeredQuestion.question}</td>
                            <td>{answeredQuestion.answer}</td>
                            <td>{answeredQuestion.costIncrease}</td>
                          </tr>
                        )
                      )}
                    </tbody> */}
                      </div>
                    ))}
                  <h1>Date and Time: {formatDate(booking.date)}</h1>
                  <h1>
                    Expected Time To Complete: {booking.expectedTimeToComplete}{" "}
                    Hours
                  </h1>
                  <h1>Location: {booking.location}</h1>
                  {booking.userEventId === "none" &&
                  booking.status !== "Un-Paid" &&
                  booking.payment_intent &&
                  booking.status !== "Confirmed" &&
                  booking.status !== "Complete" ? (
                    <button
                      className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                      onClick={async () => {
                        await addBookingToUserCalendar(booking);
                      }}
                    >
                      Add To Calendar
                    </button>
                  ) : null}
                  <div>
                    <button
                      className="button bg-primary-700 hover:bg-primary-800 mt-3 transition-all duration-300"
                      onClick={() => {
                        setBookings((prevBookings) =>
                          prevBookings.map((b) =>
                            b._id === booking._id
                              ? {
                                  ...b,
                                  beforeImagesCollapsed:
                                    !booking.beforeImagesCollapsed || false,
                                }
                              : b
                          )
                        );
                      }}
                    >
                      {!booking?.beforeImagesCollapsed ? "Expand" : "Collapse"}{" "}
                      Before Images
                    </button>
                    {booking?.beforeImagesCollapsed &&
                      booking.beforePictures && (
                        <div>
                          {booking.beforePictures.map((pic, index) => (
                            <div key={index} className="relative">
                              <img
                                src={
                                  "https://ramsaysdetailing.ca:4000/images/" +
                                  booking._id +
                                  "/" +
                                  pic
                                }
                                alt={index}
                                className="w-[500px]"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                  <div>
                    <button
                      className="button bg-primary-700 hover:bg-primary-800 mt-3 transition-all duration-300"
                      onClick={() => {
                        setBookings((prevBookings) =>
                          prevBookings.map((b) =>
                            b._id === booking._id
                              ? {
                                  ...b,
                                  afterImagesCollapsed:
                                    !booking.afterImagesCollapsed || false,
                                }
                              : b
                          )
                        );
                      }}
                    >
                      {!booking?.afterImagesCollapsed ? "Expand" : "Collapse"}{" "}
                      After Images
                    </button>
                    {booking?.afterImagesCollapsed && booking.afterPictures && (
                      <div>
                        {booking.afterPictures.map((pic, index) => (
                          <div key={index} className="relative">
                            <img
                              src={
                                "https://ramsaysdetailing.ca:4000/images/" +
                                booking._id +
                                "/" +
                                pic
                              }
                              alt={index}
                              className="w-[500px]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {booking.userEventId !== "none" &&
                  booking.status !== "Un-Paid" &&
                  booking.payment_intent ? (
                    <button
                      className="button mt-3 bg-red-700 transition-all duration-300 hover:bg-red-800"
                      onClick={async () => {
                        await removeBookingFromUserCalendar(booking);
                      }}
                    >
                      Remove From Calendar
                    </button>
                  ) : null}
                  {booking.status === "Un-Paid" && !booking.payment_intent ? (
                    <button
                      className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                      onClick={async () => {
                        await retryPayment(booking);
                      }}
                    >
                      Retry Payment
                    </button>
                  ) : null}
                  {booking.status !== "Confirmed" &&
                  booking.status !== "Complete" ? (
                    <>
                      <button
                        className="button mt-3 bg-ramsayBlue-0 transition-all duration-300 hover:bg-blue-800"
                        onClick={async () => {
                          await fetchBusyTimesForReSchedule(
                            booking.location,
                            booking.expectedTimeToComplete,
                            booking.services.map((service) => service.title)
                          );
                          setBookingToReSchedule(booking);
                          setReScheduleBookingPopupOpen(true);
                        }}
                      >
                        Re-Schedule Booking
                      </button>
                      <ReScheduleBookingPopup />
                    </>
                  ) : null}
                  {booking.status === "Un-Paid" ||
                  (booking.status !== "Confirmed" &&
                    booking.status !== "Complete" &&
                    DateTime.fromISO(booking.date).diff(DateTime.now(), "hours")
                      .hours > 48) ? (
                    <>
                      <button
                        className="button mt-3 bg-red-700 transition-all duration-300 hover:bg-blue-800"
                        onClick={async () => {
                          setBookingToRefund(booking);
                          setRefundBookingPopupOpen(true);
                        }}
                      >
                        Cancel Booking
                      </button>
                      <RefundBookingPopup />
                    </>
                  ) : null}
                  {booking.status === "Complete" ? (
                    <>
                      <button
                        className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                        onClick={async () => {
                          setBookingToMarkConfirmed(booking);
                          setEmployeeRatingPopupOpen(true);
                        }}
                      >
                        Mark Confirmed
                      </button>
                      <EmployeeRatingPopup />
                    </>
                  ) : null}
                  <h1 className="absolute bottom-3 left-0 right-0 text-xl">
                    Status: {booking.status}
                  </h1>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-10 text-xl">
      <h1>You Have No Bookings...</h1>
    </div>
  );
};

export default Bookings;
