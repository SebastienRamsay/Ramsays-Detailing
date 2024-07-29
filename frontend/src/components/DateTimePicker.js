import { isSameDay } from "date-fns";
import { DateTime } from "luxon";
import { useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CartContext from "../context/CartContext";

const DateTimePicker = () => {
  const { setCart, cart } = useContext(CartContext);
  const busyTimes = cart.busyTimes;
  const fortyEightHoursLater = DateTime.local().plus({ hours: 48 });
  if (typeof busyTimes !== "string" && busyTimes !== undefined) {
    var excludeTimes = [];
    if (busyTimes.length > 0) {
      busyTimes?.forEach((busyTime) => {
        if (
          isSameDay(new Date(busyTime.start), new Date(cart.selectedDateTime))
        ) {
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
          selected={
            cart.selectedDateTime ? new Date(cart.selectedDateTime) : null
          }
          onChange={(dateTime) => {
            setCart((prev) => ({ ...prev, selectedDateTime: dateTime }));
          }}
          minDate={fortyEightHoursLater.toJSDate()}
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
