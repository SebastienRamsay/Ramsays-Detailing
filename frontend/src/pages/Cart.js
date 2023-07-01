import { useEffect, useState } from "react"
import DatePicker from 'react-datepicker';

const Services = () => {

    const [ cart, setCart ] = useState(null)

    var [address, setAddress] = useState('');
    // var [addressValid, setAddressValid] = useState(true);
    var [addressSuggestions, setAddressSuggestions] = useState([]);

    var startTime
        

    useEffect(() => {
        const fetchServices = async () => {
            const response = await fetch('https://ramsays-detailing.onrender.com/api/cart', {
                method: 'GET',
                credentials: 'include'
            })
            const json = await response.json()

            if (response.ok){
                setCart(json)
            }
        }

        fetchServices()
    }, []) // add an empty dependency array to run the effect only once on mount


    async function createCalendarEvent() {
        try {
          const response = await fetch('https://ramsays-detailing.onrender.com/Calendar', {
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

    const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion);
    setAddressSuggestions([]);
    };

    const handleAddressSuggestions = async (e) => {
        const inputAddress = e.target.value;
        setAddress(inputAddress);
      
        if (inputAddress.trim() === '') {
          setAddressSuggestions([]);
          return;
        }
      
        try {
          const response = await fetch(`https://ramsays-detailing.onrender.com/places/autocomplete?input=${encodeURIComponent(inputAddress)}`);
      
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

    const handleAddressChange = async (e) => {
    setAddress(e.target.value);
    // const isValid = await confirmAddressExists(address);
    // setAddressValid(isValid);
    };

    // async function confirmAddressExists(address) {
    //   try {
    //     const response = await fetch(`/confirm-address?address=${encodeURIComponent(address)}`);
    //     const data = await response.json();
    
    //     if (data.valid) {
    //       console.log('Address is valid');
    //       const formattedAddress = data.formattedAddress;
    //       console.log('Formatted Address:', formattedAddress);
    //       return true;
    //     } else {
    //       console.log('Address is invalid or not found');
    //       return false;
    //     }
    //   } catch (error) {
    //     console.log('Error occurred while confirming address:', error);
    //     return false;
    //   }
    // }

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

    async function removeFromCart(_id){
        try{
            const response = await fetch('https://ramsays-detailing.onrender.com/api/cart', {
                method: 'DELETE',
                credentials: 'include', // Include cookies in the request
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "_id": _id })
            });

            if (response.ok){
                setCart((prevCart) => {
                    const serviceToRemove = prevCart.services.find(
                      (service) => service._id === _id
                    );
                    const updatedServices = prevCart.services.filter(
                      (service) => service._id !== _id
                    );
                    const updatedPrice = prevCart.price - serviceToRemove.servicePrice;
                    
                    return { ...prevCart, services: updatedServices, price: updatedPrice };
                  });
                  
            }else{
                
            }
        }catch(error){
            console.log(error)
        }
        
    }


    try{
        if (cart.services.length > 0){
            return (
                <div class="flex justify-center gap-10">
                    <h1>{cart.price}</h1>
                    {cart.services && cart.services.map(service => (
                        <div key={service._id}>
                            <h1>{service.serviceName}</h1>
                            <h1>{service.servicePrice}</h1>
                            {service.answeredQuestions && service.answeredQuestions.map(answeredQuestion => (
                                <div key={answeredQuestion._id}>
                                    <h1>{answeredQuestion.question}</h1>
                                    <h1>{answeredQuestion.answer}</h1>
                                </div>
                            ))}
                            <button onClick={() => removeFromCart(service._id)}>Remove</button>
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
                    <button class="button" onClick={createCalendarEvent}>Book Detailing</button>
                </div>
            )  
        }
    }catch(error){
        
    }
    
    return (
            <div class="flex justify-center gap-10">
                <h1>Your cart is empty...</h1>
            </div>
        )
}
export default Services