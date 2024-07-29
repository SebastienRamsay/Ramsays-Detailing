import React, { createContext, useState } from "react";

const PopupContext = createContext();

function PopupContextProvider(props) {
  const [deleteServicePopupOpen, setDeleteServicePopupOpen] = useState(false);
  const [refundBookingPopupOpen, setRefundBookingPopupOpen] = useState(false);
  const [employeeRatingPopupOpen, setEmployeeRatingPopupOpen] = useState(false);
  const [service, setServiceToDelete] = useState("Not Working");
  const [bookingToRefund, setBookingToRefund] = useState("Not Working");
  const [bookingToMarkConfirmed, setBookingToMarkConfirmed] =
    useState("Not Working");
  const [reSchedulePopupOpen, setReScheduleBookingPopupOpen] = useState(false);
  const [bookingToReSchedule, setBookingToReSchedule] = useState("Not Working");
  const [selectedDateTimeToReSchedule, setSelectedDateTimeToReSchedule] =
    useState(undefined);
  const [reScheduleBusyTimes, setReScheduleBusyTimes] = useState([]);

  return (
    <PopupContext.Provider
      value={{
        deleteServicePopupOpen,
        setDeleteServicePopupOpen,
        setServiceToDelete,
        refundBookingPopupOpen,
        setRefundBookingPopupOpen,
        service,
        setBookingToRefund,
        bookingToRefund,
        bookingToMarkConfirmed,
        setBookingToMarkConfirmed,
        setEmployeeRatingPopupOpen,
        employeeRatingPopupOpen,
        setBookingToReSchedule,
        bookingToReSchedule,
        setReScheduleBookingPopupOpen,
        reSchedulePopupOpen,
        selectedDateTimeToReSchedule,
        setSelectedDateTimeToReSchedule,
        reScheduleBusyTimes,
        setReScheduleBusyTimes,
      }}
    >
      {props.children}
    </PopupContext.Provider>
  );
}

export default PopupContext;

export { PopupContextProvider };
