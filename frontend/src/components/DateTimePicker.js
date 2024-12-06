import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateTimePicker = () => {
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const handleDateTimeChange = (dateTime) => {
    setSelectedDateTime(dateTime);
  };

  return (
    <div>
      <h2>Select Date and Time</h2>
      <DatePicker
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
      />
    </div>
  );
};

export default DateTimePicker;
