import React, { useState, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import AuthContext from '../context/AuthContext'

const FullServiceDetails = ({ service }) => {
  const imageDirectory = '/images/';
  
  const imagePath = imageDirectory + service.localImageName;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  var [answeredQuestions] = useState([])
  var [price, setPrice] = useState(0);
  var [cartResponse, setCartResponse] = useState("")
  const { getCartLength } = useContext(AuthContext)
  var [additionalQuestions, setAdditionalQuestions] = useState([]);
  




  function calculatePrice({ questionobj, question, answer, answer_id, costIncreaseString }) {
    var costIncrease = parseInt(costIncreaseString);
    var currentPrice = price;
    const answeredQuestion = answeredQuestions.find((answeredQuestion) => answeredQuestion.question === question);
    var additionalQuestions = questionobj.answers.find((answer) => answer._id === answer_id)?.additionalQuestions;

    if (answeredQuestion) { // Question Answered
      if (answeredQuestion.costIncrease){
        currentPrice -= answeredQuestion.costIncrease;
      }
      
      if (costIncrease !== "" && costIncrease !== undefined && costIncrease) {
        currentPrice += costIncrease;
      }
      answeredQuestion.costIncrease = costIncrease;
      answeredQuestion.answer = answer;
      answeredQuestion.answer_id = answer_id;
      answeredQuestion.additionalQuestions = additionalQuestions;
      answeredQuestion.questionobj = questionobj;
      answeredQuestion.question_id = questionobj._id;

      if (answeredQuestion.answer === undefined || answeredQuestion.answer === "Select" || answeredQuestion.answer === "" || !answeredQuestion.answer) {
        const indexToRemove = answeredQuestions.indexOf(answeredQuestion);
        if (indexToRemove !== -1) {
          answeredQuestions.splice(indexToRemove, 1);
        }
      }

    } else { // Question Not Answered
      currentPrice += costIncrease;
      answeredQuestions.push({ question, answer, answer_id, costIncrease, additionalQuestions, questionobj, "question_id": questionobj._id });
    }

    setPrice(currentPrice);
    setCartResponse("")
  }



  async function addToCart() {
    // use answer _id to track 
    try{
      if (answeredQuestions.length === service.questions.length + additionalQuestions.length){
        const response = await fetch('https://ramsays-detailing.onrender.com/api/cart/', {
          method: 'POST',
          credentials: 'include', // Include cookies in the request
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "service": {"serviceName": service.title, price, answeredQuestions} }),
        });

        if (response.ok) {
          const data = await response.json()
          console.log('Item added to cart: ', data)
          setCartResponse('Item added to cart')
          getCartLength()
          return true
        } else {
          console.error('failed to add item to cart: ', response.status)
          return false
        }
      }else{
        setCartResponse("Please Answer All Of The Questions.")
      }

    }catch(error){
      console.log('Error occurred while adding an item to your cart: ', error)
      setCartResponse(error)
    }
    
  }

  const handleQuestionChange = (question, target) => {
    const selectedIndex = target.selectedIndex;
    const selectedOption = target.options[selectedIndex];
    const answer_id = selectedOption.getAttribute("_id");
    const selectedAnswer = selectedOption.getAttribute("answer");
    console.log(question._id)
    var questionAlreadyAnswered = answeredQuestions.find((answeredQuestion) => answeredQuestion.question_id === question._id);
    console.log("a", answeredQuestions);

    if (questionAlreadyAnswered !== undefined) {
      const additionalQuestionsToRemove = questionAlreadyAnswered.additionalQuestions || [];
      setAdditionalQuestions((prevAdditionalQuestions) => prevAdditionalQuestions.filter((question) => !additionalQuestionsToRemove.includes(question)));
      for (let i = 0; i < questionAlreadyAnswered.additionalQuestions?.length; i++){
        const indexToRemove = answeredQuestions.findIndex((answeredQuestion) => answeredQuestion.question_id === questionAlreadyAnswered.additionalQuestions[i]._id);
        

        if (indexToRemove !== -1) {
          console.log("i", indexToRemove);
          console.log(additionalQuestionsToRemove)
          console.log("b", answeredQuestions);
          answeredQuestions.splice(indexToRemove, 1);
        }
      }
      
      

      console.log("f", answeredQuestions);
    }

       

    calculatePrice({
      questionobj: question,
      question: question.question,
      answer: selectedAnswer,
      answer_id: answer_id,
      costIncreaseString: target.value
    });

    setAdditionalQuestions((prevAdditionalQuestions) => [
      ...prevAdditionalQuestions,
      ...(answeredQuestions.find((answeredQuestion) => answeredQuestion.answer_id === answer_id)?.additionalQuestions || [])
    ]);
    
  };

  const additionalQuestionsHTML = additionalQuestions.map((additionalQuestion) => (
    <div key={additionalQuestion.question} class="mt-6">
      <h4 class="text-lg">{additionalQuestion.question}</h4>
      <select
        className="text-black rounded-md h-8 w-52"
        key={additionalQuestion.question}
        _id={additionalQuestion._id}
        id="additionalQuestion"
        onChange={(e) => handleQuestionChange(additionalQuestion, e.target)}

      >
        <option value="" key="">Select</option>
        {additionalQuestion.answers.map((additionalAnswer) => (
          <option
            key={additionalAnswer.answer}
            value={additionalAnswer.costIncrease}
            _id={additionalQuestion._id}
            answer={additionalAnswer.answer}
          >
            {additionalAnswer.answer}
          </option>
        ))}
      </select>
    </div>
  ));
  

  return (
    <div class="flex flex-col items-center">

      <img src={imagePath} alt={service.title + " Image"} class="lg:h-xl"/>
      <div class="flex flex-row gap-80">
        <div class="mt-16">
          <h4 class="text-2xl font-bold mb-5">{service.title}</h4>
          <p class='max-w-md'>{service.description}</p>
        </div>

        <div class="flex flex-col items-center mt-10 font-sans">
          <>
            {service.questions &&
              service.questions.map((question) => (
                <div key={question._id} class="mt-6">
                  <h4 class="text-lg">{question.question}</h4>
                  <select
                    className="text-black rounded-md h-8 w-52"
                    key={question.question}
                    id="questions"
                    onChange={(e) => handleQuestionChange(question, e.target)}
                  >
                    <option value={0} key={0}>
                      Select
                    </option>
                    {question.answers &&
                      question.answers.map((answer) => (
                        <option
                          key={answer.answer}
                          value={answer.costIncrease}
                          _id={answer._id}
                          answer={answer.answer}
                        >
                          {answer.answer}
                        </option>
                      ))}
                  </select>
                  
                </div>
              ))
              
            }
            {additionalQuestionsHTML}
          </>
          

          {service.questions.length + additionalQuestions.length === answeredQuestions.length ? (
            <>
              <p className="mt-8 text-lg">
                <strong>{price}</strong>
              </p>
              <button onClick={addToCart} className="bg-green-700 button mt-3">
                Add To Cart
              </button>
              <p>{cartResponse}</p>
            </>
          ) : (
            <p></p>
          )}


          
        </div>
      </div>
    </div>
  );
};

export default FullServiceDetails;
