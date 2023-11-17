import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import CartContext from "../context/CartContext";
import GoogleButton from "./googleButton";

const FullServiceDetails = ({ service }) => {
  const imageDirectory = "https://ramsaysdetailing.ca:4000/images/";

  const imagePath = imageDirectory + service.localImageName;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [editMode, setEditMode] = useState(false);
  const [answeredQuestions] = useState([]);
  const [price, setPrice] = useState(0);
  const { addToCartContext, cartContextResponse, setCartResponse } =
    useContext(CartContext);
  const { loggedIn, isAdmin } = useContext(AuthContext);
  const [additionalQuestions, setAdditionalQuestions] = useState([]);

  function calculatePrice({
    questionobj,
    question,
    answer,
    answer_id,
    costIncreaseString,
    costDecrease,
  }) {
    var costIncrease = parseInt(costIncreaseString);
    var currentPrice = price - costDecrease;

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
    var questionAlreadyAnswered = answeredQuestions.find(
      (answeredQuestion) => answeredQuestion.question_id === question._id
    );
    var costDecrease = 0;

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

        const costToRemove = answeredQuestions.filter(
          (answeredQuestion) =>
            answeredQuestion.question_id ===
            questionAlreadyAnswered.additionalQuestions[i]._id
        )[0]?.costIncrease;

        if (costToRemove > 0 && Number.isInteger(costToRemove)) {
          console.log(costDecrease, costToRemove);
          costDecrease += costToRemove;
          console.log(costDecrease);
        }

        if (indexToRemove !== -1) {
          answeredQuestions.splice(indexToRemove, 1);
        }
      }
    }

    calculatePrice({
      questionobj: question,
      question: question.question,
      answer: selectedAnswer,
      answer_id: answer_id,
      costIncreaseString: target.value,
      costDecrease,
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
        <span className="relative mb-1 flex flex-row">
          <h4 className="text-lg">{additionalQuestion.question}</h4>
          <span className="group">
            <h4 className="absolute right-0 border-spacing-3 cursor-help rounded-full border-2 border-ramsayBlue-0 px-2">
              ?
            </h4>
            <span className="absolute left-0 top-8 hidden w-56 rounded-xl bg-ramsayBlue-0 py-2 transition-all duration-500 group-hover:block">
              <p className="px-2">{additionalQuestion.description}</p>
            </span>
          </span>
        </span>
        <select
          className="h-8 w-56 rounded-md text-black"
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
          className="mt-10 md:h-xl"
        />
      </span>

      <div className="flex flex-col gap-10 sm:mr-10 sm:flex-row md:mr-0 md:gap-32">
        <div className="mx-10 mt-16">
          <h4 className="title mb-5 text-2xl font-bold">{service.title}</h4>
          <p className="max-w-md">{service.description}</p>
        </div>

        <div className="relative mt-10 flex flex-col items-center font-sans">
          <>
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setEditMode(!editMode);
                  }}
                  className="absolute right-5 sm:right-0"
                >
                  <FontAwesomeIcon icon={faPencilAlt} size="2xl sm:lg" />
                </button>
              </>
            )}

            {service.questions &&
              service.questions.map((question) => (
                <div key={question._id} className="mt-8">
                  {!editMode ? (
                    <>
                      <span className="relative mb-1 flex flex-row">
                        <h4 className="text-lg">{question.question}</h4>
                        <span className="group">
                          <h4 className="absolute right-0 border-spacing-3 cursor-help rounded-full border-2 border-ramsayBlue-0 px-2">
                            ?
                          </h4>
                          <span className="absolute left-0 top-8 hidden w-56 rounded-xl bg-ramsayBlue-0 py-2 transition-all duration-500 group-hover:block">
                            <p className="px-2">{question.description}</p>
                          </span>
                        </span>
                      </span>

                      <select
                        className="h-8 w-56 rounded-md text-black"
                        key={question.question}
                        id="questions"
                        onChange={(e) =>
                          handleQuestionChange(question, e.target)
                        }
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
                    </>
                  ) : (
                    <>
                      <span className="flex flex-col gap-3 sm:flex-row">
                        <span>
                          <h4 className="mr-1 text-lg">Question:</h4>
                          <input
                            className="h-8 w-64 rounded-md font-sans text-black"
                            value={question.question}
                          ></input>
                          <h4 className="mr-1 text-lg">Description:</h4>
                          <textarea
                            value={question.description}
                            className="h-20"
                            maxLength={65}
                            rows={3} // You can adjust the number of rows as needed
                          ></textarea>
                        </span>

                        <span>
                          {question.answers &&
                            question.answers.map((answer) => (
                              <>
                                <h4 className="mr-1 text-lg">Awnser:</h4>
                                <input
                                  className="h-8 w-64 rounded-md font-sans text-black"
                                  value={answer.answer}
                                ></input>
                                <h4 className="mr-1 text-lg">Cost Increase:</h4>
                                <input
                                  className="h-8 w-64 rounded-md font-sans text-black"
                                  value={answer.costIncrease}
                                ></input>
                              </>
                            ))}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              ))}
            {additionalQuestionsHTML}
          </>
          {!loggedIn && (
            <div className="mt-10 flex flex-col items-center gap-5 font-sans">
              <GoogleButton />
              <h1 className="w-64 text-center">
                Please Sign In With Google To Add Services To Your Cart
              </h1>
            </div>
          )}
          {service.questions.length + additionalQuestions.length ===
          answeredQuestions.length ? (
            <>
              <p className="mt-8 text-lg">
                <strong>${price}</strong>
              </p>
              {loggedIn && (
                <button
                  onClick={addToCart}
                  className="button mt-3 bg-green-700 transition-all duration-500 hover:bg-green-800"
                >
                  Add To Cart
                </button>
              )}
              <p className="text-md mt-4 text-green-600 md:text-lg lg:text-xl">
                {cartContextResponse}
              </p>
              {cartContextResponse === "Item added to cart" && (
                <div className="mt-3 flex flex-row gap-3">
                  <Link
                    to="https://ramsaysdetailing.ca/services"
                    className="button bg-green-700 transition-all duration-500 hover:bg-green-800"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    to="https://ramsaysdetailing.ca/cart"
                    className="button bg-ramsayBlueHover-0 transition-all duration-500 hover:bg-blue-800"
                  >
                    Cart
                  </Link>
                </div>
              )}
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
