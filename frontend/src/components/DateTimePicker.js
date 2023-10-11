import { isSameDay } from "date-fns";
import { DateTime } from "luxon";
import { useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CartContext from "../context/CartContext";

const DateTimePicker = () => {
  const { busyTimes, selectedDateTime, setSelectedDateTime } =
    useContext(CartContext);

  const twoHoursLater = DateTime.local().plus({ hours: 2 });
  if (typeof busyTimes !== "string" && busyTimes !== undefined) {
    var excludeTimes = [];
    if (busyTimes.length > 0) {
      busyTimes?.forEach((busyTime) => {
        if (isSameDay(new Date(busyTime.start), new Date(selectedDateTime))) {
          let start = new Date(busyTime.start);
          let end = new Date(busyTime.end);
          let current = new Date(start);
          while (current <= end) {
            excludeTimes.push(new Date(current));
            current.setMinutes(current.getMinutes() + 15);
          }
        }
      });
    }

    return (
      <div>
        <DatePicker
          selected={selectedDateTime}
          onChange={(dateTime) => {
            setSelectedDateTime(dateTime);
          }}
          minDate={twoHoursLater.toJSDate()}
          showTimeSelect
          timeFormat="h:mm aa"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd h:mm aa"
          minTime={new Date().setHours(8, 0)}
          maxTime={new Date().setHours(15, 0)}
          placeholderText="Select date and time"
          excludeTimes={excludeTimes}
          timeZone="America/New_York"
          className="h-8 w-64 rounded-md font-sans text-black"
        />
      </div>
    );
  }
};

export default DateTimePicker;
