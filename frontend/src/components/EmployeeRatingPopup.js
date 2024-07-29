import React, { useContext, useState } from "react";
import PopupContext from "../context/PopupContext";
import BookingsContext from "../context/BookingsContext";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";

const EmployeeRatingPopup = () => {
  const {
    employeeRatingPopupOpen,
    setEmployeeRatingPopupOpen,
    bookingToMarkConfirmed,
  } = useContext(PopupContext);
  const { payoutEmployee } = useContext(BookingsContext);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(null);
  const [rateColor] = useState(null);

  const handleClose = () => {
    setEmployeeRatingPopupOpen(false);
  };

  const handleConfirm = async () => {
    if (rating === null) {
      toast.error("Please select a rating");
    }
    setEmployeeRatingPopupOpen(false);
    var booking = bookingToMarkConfirmed;
    booking.comment = comment;
    booking.rating = rating;
    await payoutEmployee(booking);
  };

  return (
    <>
      {employeeRatingPopupOpen && (
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
              Employee Review?
            </h2>
            <p className="mb-6 text-center text-black">
              This allows you to rate the employee who completed this service.
              <br />
              To Review the buisness as a whole please click{" "}
              <a
                className="text-ramsayBlue-0 underline"
                href="https://g.page/r/CQbQJliLi6kvEB0/review"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
            </p>
            <div className="mb-5 flex justify-center gap-2">
              {[...Array(5)].map((star, index) => {
                const currentRate = index + 1;
                return (
                  <>
                    <label>
                      <input
                        type="radio"
                        name="rate"
                        value={currentRate}
                        className="absolute h-0 w-0 opacity-0"
                        onClick={() => setRating(currentRate)}
                      />
                      <FaStar
                        color={
                          currentRate <= (rateColor || rating)
                            ? "yellow"
                            : "grey"
                        }
                        size={50}
                      />
                    </label>
                  </>
                );
              })}
            </div>
            <textarea
              className="mb-2 h-[8rem] w-[25rem] rounded-md"
              placeholder=" Comments? (Optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
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

export default EmployeeRatingPopup;
