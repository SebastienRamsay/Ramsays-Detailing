import React, { useContext, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import CartContext from "../context/CartContext";

const FullServiceDetails = ({ service }) => {
  const imageDirectory = "http://45.74.32.213:4000/images/";

  const imagePath = imageDirectory + service.localImageName;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  var [answeredQuestions] = useState([]);
  var [price, setPrice] = useState(0);
  var [cartResponse, setCartResponse] = useState("");
  const { addToCartContext, cartContextResponse } = useContext(CartContext);
  var [additionalQuestions, setAdditionalQuestions] = useState([]);

  function calculatePrice({
    questionobj,
    question,
    answer,
    answer_id,
    costIncreaseString,
  }) {
    var costIncrease = parseInt(costIncreaseString);
    var currentPrice = price;
    const answeredQuestion = answeredQuestions.find(
      (answeredQuestion) => answeredQuestion.question === question
    );
    var additionalQuestions = questionobj.answers.find(
      (answer) => answer._id === answer_id
    )?.additionalQuestions;

    if (answeredQuestion) {
      // Question Answered
      if (answeredQuestion.costIncrease) {
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

      if (
        answeredQuestion.answer === undefined ||
        answeredQuestion.answer === "Select" ||
        answeredQuestion.answer === "" ||
        !answeredQuestion.answer
      ) {
        const indexToRemove = answeredQuestions.indexOf(answeredQuestion);
        if (indexToRemove !== -1) {
          answeredQuestions.splice(indexToRemove, 1);
        }
      }
    } else {
      // Question Not Answered
      currentPrice += costIncrease;
      answeredQuestions.push({
        question,
        answer,
        answer_id,
        costIncrease,
        additionalQuestions,
        questionobj,
        question_id: questionobj._id,
      });
    }

    setPrice(currentPrice);
    setCartResponse("");
  }

  async function addToCart() {
    // use answer _id to track
    try {
      if (
        answeredQuestions.length ===
        service.questions.length + additionalQuestions.length
      ) {
        service.price = price;
        service.answeredQuestions = answeredQuestions;

        addToCartContext(service);
        setCartResponse(cartContextResponse);
      } else {
        setCartResponse("Please Answer All Of The Questions.");
      }
    } catch (error) {
      console.log("Error occurred while adding an item to your cart: ", error);
      setCartResponse(error);
    }
  }

  const handleQuestionChange = (question, target) => {
    const selectedIndex = target.selectedIndex;
    const selectedOption = target.options[selectedIndex];
    const answer_id = selectedOption.getAttribute("_id");
    const selectedAnswer = selectedOption.getAttribute("answer");
    console.log(question._id);
    var questionAlreadyAnswered = answeredQuestions.find(
      (answeredQuestion) => answeredQuestion.question_id === question._id
    );
    console.log("a", answeredQuestions);

    if (questionAlreadyAnswered !== undefined) {
      const additionalQuestionsToRemove =
        questionAlreadyAnswered.additionalQuestions || [];
      setAdditionalQuestions((prevAdditionalQuestions) =>
        prevAdditionalQuestions.filter(
          (question) => !additionalQuestionsToRemove.includes(question)
        )
      );
      for (
        let i = 0;
        i < questionAlreadyAnswered.additionalQuestions?.length;
        i++
      ) {
        const indexToRemove = answeredQuestions.findIndex(
          (answeredQuestion) =>
            answeredQuestion.question_id ===
            questionAlreadyAnswered.additionalQuestions[i]._id
        );

        if (indexToRemove !== -1) {
          console.log("i", indexToRemove);
          console.log(additionalQuestionsToRemove);
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
      costIncreaseString: target.value,
    });

    setAdditionalQuestions((prevAdditionalQuestions) => [
      ...prevAdditionalQuestions,
      ...(answeredQuestions.find(
        (answeredQuestion) => answeredQuestion.answer_id === answer_id
      )?.additionalQuestions || []),
    ]);
  };

  const additionalQuestionsHTML = additionalQuestions.map(
    (additionalQuestion) => (
      <div key={additionalQuestion.question} className="mt-6">
        <h4 className="text-lg">{additionalQuestion.question}</h4>
        <select
          className="h-8 w-52 rounded-md text-black"
          key={additionalQuestion.question}
          _id={additionalQuestion._id}
          id="additionalQuestion"
          onChange={(e) => handleQuestionChange(additionalQuestion, e.target)}
        >
          <option value="" key="">
            Select
          </option>
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
    )
  );

  return (
    <div className="flex flex-col items-center pb-40">
      <span className="mx-10">
        <img
          src={imagePath}
          alt={service.title + " Image"}
          className="mt-10 lg:h-xl"
        />
      </span>

      <div className="mx-10 flex flex-col md:flex-row lg:gap-80">
        <div className="mt-16">
          <h4 className="title mb-5 text-2xl font-bold">{service.title}</h4>
          <p className="max-w-md">{service.description}</p>
        </div>

        <div className="mt-10 flex flex-col items-center font-sans">
          <>
            {service.questions &&
              service.questions.map((question) => (
                <div key={question._id} className="mt-6">
                  <h4 className="text-lg">{question.question}</h4>
                  <select
                    className="h-8 w-52 rounded-md text-black"
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
              ))}
            {additionalQuestionsHTML}
          </>

          {service.questions.length + additionalQuestions.length ===
          answeredQuestions.length ? (
            <>
              <p className="mt-8 text-lg">
                <strong>${price}</strong>
              </p>
              <button
                onClick={addToCart}
                className="button mt-3 bg-green-700 transition-all duration-500 hover:bg-green-800"
              >
                Add To Cart
              </button>
              <p className="text-md mt-4 text-green-600 md:text-lg lg:text-xl">
                {cartResponse}
              </p>
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
