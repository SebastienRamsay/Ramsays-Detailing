import { isSameDay } from "date-fns";
import { useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CartContext from "../context/CartContext";

const DateTimePicker = ({ service, index }) => {
  const { busyTimes, selectedDateTimes, setSelectedDateTimes } =
    useContext(CartContext);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const handleDateTimeChange = (dateTime) => {
    setSelectedDateTimes((prevSelectedDateTimes) => {
      const updatedSelectedDateTimes = prevSelectedDateTimes.filter(
        (selectedDateTime) => selectedDateTime.index !== index
      );
      const selectedDateTime = {
        index,
        timeToComplete: service.timeToComplete,
        dateTime: dateTime,
      };

      return [...updatedSelectedDateTimes, selectedDateTime];
    });
  };

  const excludeDates = busyTimes
    .filter((busyTime) => busyTime.isAllDay)
    .map((busyTime) => {
      const start = new Date(busyTime.start);
      start.setDate(start.getDate() + 1);
      return start;
    });

  var excludeTimes = [];

  busyTimes.forEach((busyTime) => {
    if (
      isSameDay(
        new Date(busyTime.start),
        new Date(
          selectedDateTimes.find(
            (selectedDateTime) => selectedDateTime.index === index
          )?.dateTime
        )
      )
    ) {
      let start = new Date(busyTime.start);
      let end = new Date(busyTime.end);
      let current = new Date(start);
      console.log(busyTime);
      while (current <= end) {
        excludeTimes.push(new Date(current));
        current.setMinutes(current.getMinutes() + 15);
      }
    }
  });

  selectedDateTimes.forEach((selectedDateTime) => {
    if (
      isSameDay(
        new Date(selectedDateTime.dateTime),
        new Date(
          selectedDateTimes.find(
            (selectedDateTime) => selectedDateTime.index === index
          )?.dateTime
        )
      ) &&
      index !== selectedDateTime.index
    ) {
      let start = new Date(selectedDateTime.dateTime);
      let end = new Date(start);
      end.setHours(end.getHours() + selectedDateTime.timeToComplete);
      let current = new Date(start);
      console.log(start, end);
      console.log(selectedDateTime);
      while (current <= end) {
        excludeTimes.push(new Date(current));
        current.setMinutes(current.getMinutes() + 15);
      }
    }
  });
  console.log(excludeTimes);

  const selectedDateTimeObj = selectedDateTimes.find(
    (selectedDateTime) => selectedDateTime.index.toString() === index.toString()
  );
  const selectedDateTime = selectedDateTimeObj
    ? new Date(selectedDateTimeObj.dateTime)
    : null;
  return (
    <div>
      <h2>Select Date and Time</h2>
      <DatePicker
        index={index}
        selected={selectedDateTime}
        onChange={handleDateTimeChange}
        minDate={tomorrow}
        showTimeSelect
        timeFormat="h:mm aa"
        timeIntervals={15}
        dateFormat="yyyy-MM-dd h:mm aa"
        minTime={new Date().setHours(8, 0)}
        maxTime={new Date().setHours(15, 0)}
        placeholderText="Select date and time"
        excludeDates={excludeDates}
        excludeTimes={excludeTimes}
        className="h-8 w-52 rounded-md font-sans text-black"
      />
    </div>
  );
};

export default DateTimePicker;
