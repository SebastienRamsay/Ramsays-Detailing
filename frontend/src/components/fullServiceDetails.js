import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';







const FullServiceDetails = ({ service }) => {
  const imageDirectory = 'http://localhost:4000/images/';
  
  const imagePath = imageDirectory + service.localImageName;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  var [answeredQuestions] = useState([])
  var [price, setPrice] = useState(0);
  










  function calculatePrice({ question, answer, costIncreaseString }) {
    var costIncrease = parseInt(costIncreaseString);
    var currentPrice = price;
    const answeredQuestion = answeredQuestions.find((answeredQuestion) => answeredQuestion.question === question);


    if (answeredQuestion) {
      console.log('question answered already')
      currentPrice -= answeredQuestion.costIncrease;
      currentPrice += costIncrease;
      answeredQuestion.costIncrease = costIncrease;
      answeredQuestion.answer = answer
      console.log(answeredQuestion)
    } else {
      console.log('else')
      currentPrice += costIncrease;
      console.log({ question, answer, costIncrease })
      answeredQuestions.push({ question, answer, costIncrease });
    }

    setPrice(currentPrice);
  }



 

  

  
  
  







  async function addToCart() {
    // use answer _id to track 
    try{

      const response = await fetch('http://localhost:4000/api/cart/', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "service": {"title": service.title, price, answeredQuestions} }),
      });

      if (response.ok) {
        const data = await response.json()
        console.log('Item added to cart: ', data)
        return true
      } else {
        console.error('failed to add item to cart: ', response.status)
        return false
      }

    }catch(error){
      console.log('Error occurred while adding an item to your cart: ', error)
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
              onChange={(e) => {
                const selectedIndex = e.target.selectedIndex;
                calculatePrice({ question: question.question, answer: e.target.options[selectedIndex].dataset.key, costIncreaseString: e.target.value });
              }}>
            
            
              <option value={0} key={0}></option>
              {question.answers &&
                question.answers.map((answer) => (
                  <option key={answer.answer} value={answer.costIncrease} data-key={answer.answer}>
                    {answer.answer}
                  </option>
                ))}

            </select>

          </div>
        ))
      }

      <button onClick={addToCart}>
        Add To Cart
      </button>
    </div>
    
  );
};

export default FullServiceDetails;
