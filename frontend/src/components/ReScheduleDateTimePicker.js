import { isSameDay } from "date-fns";
import { DateTime } from "luxon";
import { useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PopupContext from "../context/PopupContext";

const ReScheduleDateTimePicker = () => {
  const {
    setSelectedDateTimeToReSchedule,
    selectedDateTimeToReSchedule,
    reScheduleBusyTimes,
  } = useContext(PopupContext);
  console.log(reScheduleBusyTimes);
  const fortyEightHoursLater = DateTime.local().plus({ hours: 48 });
  console.log(reScheduleBusyTimes);
  if (reScheduleBusyTimes !== undefined) {
    var excludeTimes = [];
    if (reScheduleBusyTimes.length > 0) {
      reScheduleBusyTimes?.forEach((busyTime) => {
        if (
          isSameDay(
            new Date(busyTime.start),
            new Date(selectedDateTimeToReSchedule)
          )
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
            selectedDateTimeToReSchedule
              ? new Date(selectedDateTimeToReSchedule)
              : null
          }
          onChange={(dateTime) => {
            setSelectedDateTimeToReSchedule(dateTime);
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

export default ReScheduleDateTimePicker;
