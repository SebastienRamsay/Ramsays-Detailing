import React, { useContext } from "react";
import PopupContext from "../context/PopupContext";
import BookingsContext from "../context/BookingsContext";
import { DateTime } from "luxon";
import ReScheduleDateTimePicker from "./ReScheduleDateTimePicker";
import axios from "axios";

const ReScheduleBookingPopup = () => {
  const {
    reSchedulePopupOpen,
    setReScheduleBookingPopupOpen,
    bookingToReSchedule,
    selectedDateTimeToReSchedule,
  } = useContext(PopupContext);
  const { rescheduleBooking } = useContext(BookingsContext);

  const handleClose = () => {
    setReScheduleBookingPopupOpen(false);
  };

  const handleConfirm = async () => {
    setReScheduleBookingPopupOpen(false);
    if (
      (bookingToReSchedule.userEventId !== "none") | // Calendar event exists
      (bookingToReSchedule.employeeEventId !== "none")
    ) {
      await axios.delete(
        "https://ramsaysdetailing.ca:4000/calendar/cancel",
        {
          data: {
            employeeEventId: bookingToReSchedule.employeeEventId,
            employeeId: bookingToReSchedule.employeeId,
            userEventId: bookingToReSchedule.userEventId,
            userId: bookingToReSchedule.userId,
            bookingId: bookingToReSchedule._id,
          },
        },
        {
          withCredentials: true, // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    rescheduleBooking(bookingToReSchedule, selectedDateTimeToReSchedule);
  };

  return (
    <>
      {reSchedulePopupOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <h2 className="mb-4 text-xl font-bold text-black">
              Re-Schedule Booking?
            </h2>
            <h3 className="mb-2">
              <strong>Current Booking Date:</strong>{" "}
              {DateTime.fromISO(bookingToReSchedule.date).toFormat(
                "yyyy-MM-dd hh:mm a ZZZZ"
              )}
            </h3>
            <ReScheduleDateTimePicker />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleConfirm}
                className="mr-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Confirm
              </button>
              <button
                onClick={handleClose}
                className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReScheduleBookingPopup;
