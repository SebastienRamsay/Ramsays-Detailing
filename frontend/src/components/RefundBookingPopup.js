import React, { useContext } from "react";
import PopupContext from "../context/PopupContext";
import BookingsContext from "../context/BookingsContext";
import { DateTime } from "luxon";

const RefundBookingPopup = () => {
  const { refundBookingPopupOpen, setRefundBookingPopupOpen, bookingToRefund } =
    useContext(PopupContext);
  const { deleteBooking } = useContext(BookingsContext);

  const handleClose = () => {
    setRefundBookingPopupOpen(false);
  };

  const handleConfirm = () => {
    setRefundBookingPopupOpen(false);
    deleteBooking(bookingToRefund);
  };

  return (
    <>
      {refundBookingPopupOpen && (
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
              Refund Booking?
            </h2>
            <p className="mb-6 text-center text-black">
              Are you sure you want to refund this booking?
              <br />
              <br />
              <strong>Services:</strong>
              <br />
              {bookingToRefund.services &&
                bookingToRefund.services.map((service) => (
                  <React.Fragment key={service._id}>
                    {service.title}
                  </React.Fragment>
                ))}
              <br />
              <strong>Booking Date:</strong>{" "}
              {DateTime.fromISO(bookingToRefund.date).toFormat(
                "yyyy-MM-dd hh:mm a ZZZZ"
              )}
              <br />
              <strong>Refund Amount:</strong> {bookingToRefund.price}
            </p>

            <div className="flex justify-end">
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

export default RefundBookingPopup;
