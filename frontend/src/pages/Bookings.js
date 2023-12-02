import axios from "axios";
import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import BookingsContext from "../context/BookingsContext";
import toast from "react-hot-toast";

const Bookings = () => {
  const {
    bookings,
    setClaimedBookings,
    claimedBookings,
    deleteBooking,
    addBookingToUserCalendar,
    removeBookingFromUserCalendar,
    removeBookingFromEmployeeCalendar,
    addBookingToEmployeeCalendar,
    unClaimBooking,
    claimBooking,
  } = useContext(BookingsContext);
  const { isAdmin, isEmployee } = useContext(AuthContext);
  const imageDirectory = "https://ramsaysdetailing.ca:4000/images/";

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
        setClaimedBookings((old) =>
          old.map((booking) => ({
            ...booking,
            beforePictures:
              booking._id === claimedBooking._id
                ? claimedBooking.beforePictures.filter((file) => file !== pic)
                : booking.beforePictures,
          }))
        );
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
        setClaimedBookings((old) =>
          old.map((booking) => ({
            ...booking,
            afterPictures:
              booking._id === claimedBooking._id
                ? claimedBooking.afterPictures.filter((file) => file !== pic)
                : booking.afterPictures,
          }))
        );
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
        toast.success("picture uploaded");
        const data = response.data;
        setClaimedBookings((old) => {
          // Create a new array with the updated booking object
          return old.map((booking) => {
            if (booking._id === claimedBooking._id) {
              // Update the beforePictures property
              return {
                ...booking,
                beforePictures: data.imageNames,
              };
            }
            return booking; // Return other bookings unchanged
          });
        });
      } else {
        console.error(response.data);
      }
    } catch (error) {
      console.error("Error uploading files", error);
    }
  };

  const submitAfter = async ({ event, claimedBooking }) => {
    const files = Array.from(event.target.files);

    setClaimedBookings((old) => {
      // Create a new array with the updated booking object
      return old.map((booking) => {
        if (booking._id === claimedBooking._id) {
          // Update the beforePictures property
          return {
            ...booking,
            afterFiles: files,
          };
        }
        return booking; // Return other bookings unchanged
      });
    });

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
        toast.success("picture uploaded");
        const data = await response.data;
        setClaimedBookings((old) => {
          // Create a new array with the updated booking object
          return old.map((booking) => {
            if (booking._id === claimedBooking._id) {
              // Update the beforePictures property
              return {
                ...booking,
                afterPictures: data.imageNames,
              };
            }
            return booking; // Return other bookings unchanged
          });
        });
      } else {
        console.error(response.data);
      }
    } catch (error) {
      console.error("Error uploading files", error);
    }
  };

  if (
    (bookings && bookings.length > 0) ||
    (claimedBookings && claimedBookings.length > 0)
  ) {
    if (isAdmin || isEmployee) {
      return (
        <div className="mx-10 flex flex-col items-center justify-center gap-10 py-10">
          <div className="rounded-lg bg-primary-0 p-8 pb-16 text-center md:p-10">
            <div
              className={
                "grid gap-10 " +
                (bookings.length > 2 ? "2xl:grid-cols-3 " : " ") +
                (bookings.length > 1 ? "md:grid-cols-2 " : " ")
              }
            >
              {bookings.length > 0 && (
                <h1 className="text-2xl font-bold">Un-Claimed Bookings</h1>
              )}
              {bookings &&
                bookings.map((booking, index) => (
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
                                  <tr key={`${answeredQuestion._id}-${qIndex}`}>
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
                      Expected Time To Fully Complete:{" "}
                      {booking.expectedTimeToComplete} Hours
                    </h1>
                    <h1>Client Name: {booking.name}</h1>
                    <h1>Client Phone Number: {booking.phoneNumber}</h1>
                    <h1>Client Email: {booking.email}</h1>
                    <h1>Booking Date and Time: {formatDate(booking.date)}</h1>

                    <button
                      className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                      onClick={async () => {
                        await claimBooking(booking);
                      }}
                    >
                      Claim Booking
                    </button>

                    <button
                      className="button mt-3 bg-ramsayBlue-0 transition-all duration-300 hover:bg-blue-800"
                      onClick={async () => await deleteBooking(booking, true)}
                    >
                      Cancel Booking
                    </button>
                  </div>
                ))}
              {claimedBookings.length > 0 && (
                <h1 className="text-2xl font-bold">Claimed Bookings</h1>
              )}
              {claimedBookings &&
                claimedBookings.map((claimedBooking, index) => (
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
                                  <tr key={`${answeredQuestion._id}-${qIndex}`}>
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
                      Expected Time To Fully Complete:{" "}
                      {claimedBooking.expectedTimeToComplete} Hours
                    </h1>
                    <h1>Client Name: {claimedBooking.name}</h1>
                    <h1>Client Phone Number: {claimedBooking.phoneNumber}</h1>
                    <h1>Client Email: {claimedBooking.email}</h1>
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
                      <div>
                        {Array.isArray(claimedBooking.beforePictures) &&
                          claimedBooking.beforePictures.map((pic, index) => (
                            <div key={index} className="relative">
                              <button
                                onClick={() =>
                                  deleteBefore({ claimedBooking, pic })
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
                          ))}
                      </div>
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

                      <div>
                        {claimedBooking.afterPictures &&
                          claimedBooking.afterPictures.map((pic, index) => (
                            <div key={index} className="relative">
                              <button
                                onClick={() =>
                                  deleteAfter({ claimedBooking, pic })
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
                          ))}
                      </div>
                    </div>

                    <button
                      className="button mt-3 bg-red-700 transition-all duration-300 hover:bg-red-800"
                      onClick={async () =>
                        await deleteBooking(claimedBooking, true)
                      }
                    >
                      Cancel Booking
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="mx-10 flex flex-col items-center justify-center gap-10 py-10">
        <div className="rounded-lg bg-primary-0 p-8 pb-16 text-center md:p-10">
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
                  className="flex flex-col gap-2 border bg-secondary-0 p-3 font-bold"
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
                  <h1>Booking Date and Time: {formatDate(booking.date)}</h1>
                  <h1>
                    Expected Time To Fully Complete:{" "}
                    {booking.expectedTimeToComplete} Hours
                  </h1>
                  <h1>
                    Claimed: {booking.employeeId === "none" ? "NO" : "YES"}
                  </h1>
                  {booking.userEventId === "none" && (
                    <button
                      className="button mt-3 bg-green-700 transition-all duration-300 hover:bg-green-800"
                      onClick={async () => {
                        await addBookingToUserCalendar(booking);
                      }}
                    >
                      Add To Calendar
                    </button>
                  )}
                  {booking.userEventId !== "none" && (
                    <button
                      className="button mt-3 bg-red-700 transition-all duration-300 hover:bg-red-800"
                      onClick={async () => {
                        await removeBookingFromUserCalendar(booking);
                      }}
                    >
                      Remove From Calendar
                    </button>
                  )}
                  <button
                    className="button mt-3 bg-ramsayBlue-0 transition-all duration-300 hover:bg-blue-800"
                    onClick={async () => await deleteBooking(booking, false)}
                  >
                    Cancel Booking
                  </button>
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
