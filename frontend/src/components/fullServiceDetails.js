import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles.css';

const imageDirectory = 'http://localhost:4000/images/';
var answeredQuestions = [];
var startTime



const DateTimePicker = () => {
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  startTime = selectedDateTime
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

const FullServiceDetails = ({ service }) => {
  const imagePath = imageDirectory + service.localImageName;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  var [price, setPrice] = useState(0);
  var [address, setAddress] = useState('');
  var [addressValid, setAddressValid] = useState(true);
  var [addressSuggestions, setAddressSuggestions] = useState([]);

  async function confirmAddressExists(address) {
    try {
      const response = await fetch(`http://localhost:4000/confirm-address?address=${encodeURIComponent(address)}`);
      const data = await response.json();
  
      if (data.valid) {
        console.log('Address is valid');
        const formattedAddress = data.formattedAddress;
        console.log('Formatted Address:', formattedAddress);
        return true;
      } else {
        console.log('Address is invalid or not found');
        return false;
      }
    } catch (error) {
      console.log('Error occurred while confirming address:', error);
      return false;
    }
  }

  function calculatePrice({ question, costIncreaseString }) {
    var costIncrease = parseInt(costIncreaseString);
    console.log(answeredQuestions);
    var currentPrice = price;

    if (answeredQuestions.some((answeredQuestion) => answeredQuestion.question === question)) {
      const answeredQuestion = answeredQuestions.find((answeredQuestion) => answeredQuestion.question === question);
      currentPrice -= answeredQuestion.costIncrease;
      currentPrice += costIncrease;
      answeredQuestion.costIncrease = costIncrease;
    } else {
      currentPrice += costIncrease;
      answeredQuestions.push({ question, costIncrease });
    }

    setPrice(currentPrice);
  }

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    setAddressValid(true); // Reset address validity when address changes
  };

  const handleCheckAddress = async () => {
    const isValid = await confirmAddressExists(address);
    setAddressValid(isValid);
  };

  const handleAddressSuggestions = async (e) => {
    const inputAddress = e.target.value;
    setAddress(inputAddress);
  
    if (inputAddress.trim() === '') {
      setAddressSuggestions([]);
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:4000/places/autocomplete?input=${encodeURIComponent(inputAddress)}`);
  
      if (response.status === 200) {
        try {
          const data = await response.json();
  
          if (data.status === 'OK') {
            setAddressSuggestions(data.predictions.map((prediction) => prediction.description));
          } else {
            setAddressSuggestions([]);
          }
        } catch (error) {
          console.error('Error occurred while parsing response:', error);
          setAddressSuggestions([]);
        }
      } else if (response.status === 304) {
        // Handle the case where the data has not been modified
        // Use the cached data or take appropriate action
      } else {
        // Handle other error cases
        console.error('Error occurred while fetching address suggestions:', response.status);
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Error occurred while fetching address suggestions:', error);
      setAddressSuggestions([]);
    }
  };
  
  
  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion);
    setAddressSuggestions([]);
  };

  async function createCalendarEvent() {
    try {
      const response = await fetch('http://localhost:4000/Calendar', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "summary":"summary", "location":"", "description":"description", "startTime":startTime, "endTime":"" }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Calendar event created successfully:', data);
        return true;
      } else {
        console.error('Failed to create calendar event:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error occurred while creating calendar event:', error);
      return false;
    }
  }
  
  

  return (
    <div className="service-details">
      <img src={imagePath} alt="" />
      <h4>{service.title}</h4>
      <p>
        <strong>$</strong>
        {price}
      </p>

      {service.questions &&
        service.questions.map((question) => (
          <div key={question._id} className="question">
            <h4>{question.question}</h4>
            <select
              key={question.question}
              id="questions"
              onChange={(e) => calculatePrice({ question: question.question, costIncreaseString: e.target.value })}
            >
              <option value={0} key={0}></option>
              {question.answers &&
                question.answers.map((answer) => (
                  <option key={answer.answer} value={answer.costIncrease}>
                    {answer.answer}
                  </option>
                ))}
            </select>
          </div>
        ))}

      <DateTimePicker />

      <div className="address-input-container">
        <input
          type="text"
          placeholder="Enter address"
          value={address || ''}
          onChange={handleAddressChange}
          onKeyUp={handleAddressSuggestions}
        />
        {addressSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {addressSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={createCalendarEvent}>Check Address</button>
    </div>
    
  );
};

export default FullServiceDetails;
