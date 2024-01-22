import { faArrowLeft, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import CartContext from "../context/CartContext";
import GoogleButton from "./googleButton";
import ServicesContext from "../context/ServicesContext";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteServicePopup from "./DeleteServicePopup";
import PopupContext from "../context/PopupContext";

const FullServiceDetails = ({ tempService }) => {
  const imageDirectory = "https://ramsaysdetailing.ca:4000/images/";
  const { setIsOpen, setServiceToDelete } = useContext(PopupContext);
  const navigate = useNavigate();
  const [service, setService] = useState(
    tempService?.localImageName
      ? tempService
      : {
          newService: true,
          title: "",
          description: "",
        }
  );
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [imageToUpload, setImageToUpload] = useState(undefined);
  const [editMode, setEditMode] = useState(false);
  const [answeredQuestions] = useState([]);
  const [price, setPrice] = useState(0);
  const { addToCartContext, cartContextResponse, setCartResponse } =
    useContext(CartContext);
  const { loggedIn, isAdmin } = useContext(AuthContext);
  const [additionalQuestions, setAdditionalQuestions] = useState([]);
  const { updateService, newService, services } = useContext(ServicesContext);
  var cancel = {};
  cancel.service = tempService;

  console.log("service: ", service);
  console.log("answeredQuestions: ", answeredQuestions);
  console.log("additionalQuestions: ", additionalQuestions);
  useEffect(() => {
    if (
      tempService &&
      !services.some((s) => s._id === service._id) &&
      tempService?.newService !== true
    ) {
      navigate("/services");
    }
  }, [services, service, navigate, tempService]);

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
      (answeredQuestion) => answeredQuestion.questionobj._id === questionobj._id
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

  const submitServiceImage = async () => {
    try {
      const formData = new FormData();
      formData.append("image", imageToUpload);

      const response = await axios.post(
        "https://ramsaysdetailing.ca:4000/upload/service",
        formData, // Use the FormData directly as the data
        {
          withCredentials: true, // Use withCredentials instead of credentials
          headers: {
            "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;

        setService((old) => {
          let temp = { ...old };
          temp.localImageName = data.imageName;
          return temp;
        });
        setImageToUpload(undefined);
        return data.imageName;
      } else {
        console.error(response.data);
      }
    } catch (error) {
      console.error("Error uploading files", error);
    }
  };
  console.log(service);
  return (
    <div className="relative flex flex-col items-center gap-5 pb-10 pt-5">
      <Link
        to="/services"
        className="absolute left-5 top-2 flex gap-2 rounded-lg bg-primary-0 p-3 transition-all hover:scale-110 active:scale-105 md:left-10"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mt-[0.1rem]" />
        Back
      </Link>
      {isAdmin && (
        <>
          <button
            onClick={async () => {
              if (editMode) {
                if (imageToUpload !== undefined) {
                  const image = await submitServiceImage();

                  if (service?.newService) {
                    let newServiceObject = service;
                    newServiceObject.localImageName = image;
                    newServiceObject.questions =
                      newServiceObject?.questions?.map((question) => {
                        question._id = undefined;
                        question?.answers?.map((answer) => {
                          answer._id = undefined;
                          answer?.additionalQuestions?.map((aq) => {
                            aq._id = undefined;
                            aq?.answers?.map((a) => {
                              a._id = undefined;
                              return a;
                            });
                            return aq;
                          });
                          return answer;
                        });
                        return question;
                      });
                    await newService(newServiceObject);
                    navigate(`/services`);
                    return;
                  } else {
                    let newServiceObject = service;
                    newServiceObject.localImageName = image;
                    await updateService(newServiceObject);
                  }
                } else {
                  if (service?.newService) {
                    toast.error("Service Must Have An Image");
                    return;
                  } else {
                    await updateService(service);
                  }
                }
              } else {
                cancel = service;
              }
              setEditMode(!editMode);
            }}
            className="absolute right-5 top-3 sm:right-10"
          >
            <FontAwesomeIcon icon={faPencilAlt} size="lg" />
          </button>
          <button
            className="absolute right-16 top-3 mb-1 sm:right-20"
            onClick={() => {
              if (tempService?._id) {
                setServiceToDelete(service);
                setIsOpen(true);
              } else {
                setService({
                  newService: true,
                  title: "",
                  description: "",
                });
                navigate("/services");
              }
            }}
          >
            <MdDeleteForever size={25} />
          </button>
          <DeleteServicePopup />
        </>
      )}
      {editMode && (
        <button
          onClick={() => {
            setEditMode(!editMode);
            setService(cancel.service);
            setImageToUpload(undefined);
          }}
          className="sm:right-30 absolute right-32 top-3"
        >
          Cancel
        </button>
      )}

      {!editMode && service?.localImageName ? (
        <span className="mx-10">
          <img
            src={imageDirectory + service.localImageName}
            alt={service.title + " Image"}
            className="mt-10 md:h-xl"
          />
        </span>
      ) : (
        <span className="mx-10">
          {imageToUpload ? (
            <img
              src={URL.createObjectURL(imageToUpload)}
              alt={imageToUpload}
              className="mt-10 md:h-xl"
            />
          ) : service?.localImageName ? (
            <img
              src={imageDirectory + service.localImageName}
              alt={service.title + " Image"}
              className="mt-10 md:h-xl"
            />
          ) : (
            <p>no image</p>
          )}
          {editMode ? (
            <input
              type="file"
              id="ServiceImage"
              accept="image/*"
              onChange={async (event) => {
                setImageToUpload(event.target.files[0]);
              }}
            />
          ) : null}
        </span>
      )}

      <div
        className={`flex gap-10  ${
          editMode ? "flex-col" : "flex-col sm:flex-row"
        }`}
      >
        {!editMode ? (
          <div className="mx-10 mt-16">
            <h4 className="title mb-5 text-2xl font-bold">{service?.title}</h4>
            <p className="max-w-md">{service?.description}</p>
          </div>
        ) : (
          <div className="mx-10 mt-16">
            <h4 className="mr-1 text-lg">Title:</h4>
            <input
              className="h-8 w-48 rounded-md font-sans text-black"
              value={service?.title}
              onChange={(e) => {
                setService((prev) => {
                  let temp = { ...prev };
                  temp.title = e.target.value;
                  return temp;
                });
              }}
            ></input>
            <h4 className="mr-1text-lg">Description:</h4>
            <textarea
              value={service?.description}
              onChange={(e) => {
                setService((prev) => {
                  let temp = { ...prev };
                  temp.description = e.target.value;
                  return temp;
                });
              }}
              className="h-[8rem] w-[25rem] text-black"
              maxLength={100}
              rows={3} // You can adjust the number of rows as needed
            ></textarea>

            <h4 className="mr-1 text-lg">Minutes To Complete:</h4>
            <input
              className="h-8 w-48 rounded-md font-sans text-black"
              value={service?.timeToComplete | 0}
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              onChange={(e) => {
                setService((prev) => {
                  let temp = { ...prev };
                  temp.timeToComplete = e.target.value;
                  return temp;
                });
              }}
            ></input>
          </div>
        )}

        <div className="mx-10 flex flex-col items-center gap-3 pb-10 font-sans">
          {service?.questions &&
            service.questions.map((question, q) => (
              <div key={question._id} className="mt-8">
                {!editMode ? (
                  <>
                    <span className="relative mb-1 flex flex-row">
                      <h4 className="text-lg">{question.question}</h4>
                      <span className="group">
                        <h4 className="absolute right-0 border-spacing-3 cursor-help rounded-full border-2 border-ramsayBlue-0 px-2">
                          ?
                        </h4>
                        <span className="absolute left-0 top-8 z-10 hidden w-56 rounded-xl bg-ramsayBlue-0 py-2 transition-all duration-500 group-hover:block">
                          <p className="px-2">{question.description}</p>
                        </span>
                      </span>
                    </span>

                    <select
                      className="h-8 w-56 rounded-md text-black"
                      key={question._id}
                      id="questions"
                      onChange={(e) => handleQuestionChange(question, e.target)}
                    >
                      <option value={0} key={0}>
                        Select
                      </option>
                      {question.answers &&
                        question.answers.map((answer) => (
                          <option
                            key={answer._id}
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
                  <span className="relative flex flex-col items-center gap-3 rounded-lg bg-primary-0 p-10">
                    <span>
                      <button
                        className="absolute right-5 top-5"
                        onClick={() => {
                          setService((prev) => {
                            let temp = { ...prev };
                            temp.questions = temp.questions.filter(
                              (Question) => Question !== question
                            );
                            return temp;
                          });
                        }}
                      >
                        <MdDeleteForever size={30} />
                      </button>
                      <div>
                        <h4 className="mr-1 text-lg">Question:</h4>
                        <input
                          className="h-8 w-48 rounded-md font-sans text-black"
                          value={question.question}
                          onChange={(e) => {
                            setService((prev) => {
                              let temp = { ...prev };
                              temp.questions[q].question = e.target.value;
                              return temp;
                            });
                          }}
                        ></input>
                      </div>

                      <div>
                        <h4 className="mr-1text-lg">Description:</h4>
                        <textarea
                          value={question.description}
                          onChange={(e) => {
                            setService((prev) => {
                              let temp = { ...prev };
                              temp.questions[q].description = e.target.value;
                              return temp;
                            });
                          }}
                          className="h-20 w-48 text-black"
                          maxLength={65}
                          rows={3} // You can adjust the number of rows as needed
                        ></textarea>
                      </div>
                    </span>

                    <span className="flex flex-row gap-3">
                      {question.answers &&
                        question.answers.map((answer, a) => (
                          <div key={answer._id} className="flex flex-col gap-3">
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-secondary-0 p-2">
                              <div>
                                <h4 className="mr-1 text-lg">Answer:</h4>
                                <input
                                  className="h-8 w-48 rounded-md font-sans text-black"
                                  value={answer.answer}
                                  onChange={(e) => {
                                    setService((prev) => {
                                      let temp = { ...prev };
                                      temp.questions[q].answers[a].answer =
                                        e.target.value;
                                      return temp;
                                    });
                                  }}
                                ></input>
                              </div>
                              <div>
                                <h4 className="mr-1 text-lg">Cost Increase:</h4>
                                <input
                                  className="h-8 w-48 rounded-md font-sans text-black"
                                  value={answer.costIncrease}
                                  type="number"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  onChange={(e) => {
                                    setService((prev) => {
                                      let temp = { ...prev };
                                      temp.questions[q].answers[
                                        a
                                      ].costIncrease = e.target.value;
                                      return temp;
                                    });
                                  }}
                                ></input>
                              </div>

                              <div>
                                <h4 className="mr-1 text-lg">
                                  Minutes To Complete:
                                </h4>
                                <input
                                  className="h-8 w-48 rounded-md font-sans text-black"
                                  value={answer.timeToComplete}
                                  type="number"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  onChange={(e) => {
                                    setService((prev) => {
                                      let temp = { ...prev };
                                      temp.questions[q].answers[
                                        a
                                      ].timeToComplete = e.target.value;
                                      return temp;
                                    });
                                  }}
                                ></input>
                              </div>

                              <button
                                className="h-[1rem] w-[8rem] rounded-xl bg-red-600 pb-10 text-3xl transition-all duration-300 hover:bg-red-700 "
                                onClick={() => {
                                  setService((prev) => {
                                    let temp = { ...prev };
                                    temp.questions[q].answers = temp.questions[
                                      q
                                    ].answers.filter(
                                      (Answer) => Answer !== answer
                                    );
                                    return temp;
                                  });
                                }}
                              >
                                -
                              </button>
                            </div>
                            <div className="flex flex-col gap-3">
                              {answer.additionalQuestions &&
                                answer.additionalQuestions.map(
                                  (additionalQuestion, aq) => (
                                    <div
                                      key={aq}
                                      className="flex flex-col gap-3"
                                    >
                                      <span className="flex flex-col items-center justify-center gap-3 rounded-xl bg-secondary-0 p-2">
                                        <div>
                                          <h4 className="mr-1 text-lg">
                                            Question:
                                          </h4>
                                          <input
                                            className="h-8 w-48 rounded-md font-sans text-black"
                                            value={additionalQuestion.question}
                                            onChange={(e) => {
                                              setService((prev) => {
                                                let temp = { ...prev };
                                                temp.questions[q].answers[
                                                  a
                                                ].additionalQuestions[
                                                  aq
                                                ].question = e.target.value;
                                                return temp;
                                              });
                                            }}
                                          ></input>
                                        </div>

                                        <div>
                                          <h4 className="mr-1text-lg">
                                            Description:
                                          </h4>
                                          <textarea
                                            value={
                                              additionalQuestion.description
                                            }
                                            onChange={(e) => {
                                              setService((prev) => {
                                                let temp = { ...prev };
                                                temp.questions[q].answers[
                                                  a
                                                ].additionalQuestions[
                                                  aq
                                                ].description = e.target.value;
                                                return temp;
                                              });
                                            }}
                                            className="h-20 w-48 text-black"
                                            maxLength={65}
                                            rows={3} // You can adjust the number of rows as needed
                                          ></textarea>
                                        </div>

                                        <button
                                          className="h-[1rem] w-[8rem] rounded-xl bg-red-600 pb-10 text-3xl transition-all duration-300 hover:bg-red-700 "
                                          onClick={() => {
                                            setService((prev) => {
                                              let temp = { ...prev };
                                              temp.questions[q].answers[
                                                a
                                              ].additionalQuestions =
                                                temp.questions[q].answers[
                                                  a
                                                ].additionalQuestions.filter(
                                                  (AdditionalQuestion) =>
                                                    AdditionalQuestion !==
                                                    additionalQuestion
                                                );
                                              return temp;
                                            });
                                          }}
                                        >
                                          -
                                        </button>
                                      </span>

                                      <span className="flex flex-col items-center justify-center gap-3">
                                        {additionalQuestion.answers &&
                                          additionalQuestion.answers.map(
                                            (answer, aqa) => (
                                              <div
                                                key={answer._id}
                                                className="flex flex-col items-center gap-3 rounded-xl bg-secondary-0 p-2"
                                              >
                                                <div>
                                                  <h4 className="mr-1 text-lg">
                                                    Answer:
                                                  </h4>
                                                  <input
                                                    className="h-8 w-48 rounded-md font-sans text-black"
                                                    value={answer.answer}
                                                    onChange={(e) => {
                                                      setService((prev) => {
                                                        let temp = { ...prev };
                                                        temp.questions[
                                                          q
                                                        ].answers[
                                                          a
                                                        ].additionalQuestions[
                                                          aq
                                                        ].answers[aqa].answer =
                                                          e.target.value;
                                                        return temp;
                                                      });
                                                    }}
                                                  ></input>
                                                </div>
                                                <div>
                                                  <h4 className="mr-1 text-lg">
                                                    Cost Increase:
                                                  </h4>
                                                  <input
                                                    className="h-8 w-48 rounded-md font-sans text-black"
                                                    value={answer.costIncrease}
                                                    type="number"
                                                    pattern="[0-9]*"
                                                    inputMode="numeric"
                                                    onChange={(e) => {
                                                      setService((prev) => {
                                                        let temp = { ...prev };
                                                        temp.questions[
                                                          q
                                                        ].answers[
                                                          a
                                                        ].additionalQuestions[
                                                          aq
                                                        ].answers[
                                                          aqa
                                                        ].costIncrease =
                                                          e.target.value;
                                                        return temp;
                                                      });
                                                    }}
                                                  ></input>
                                                </div>

                                                <div>
                                                  <h4 className="mr-1 text-lg">
                                                    Minutes To Complete:
                                                  </h4>
                                                  <input
                                                    className="h-8 w-48 rounded-md font-sans text-black"
                                                    value={
                                                      answer.timeToComplete
                                                    }
                                                    type="number"
                                                    pattern="[0-9]*"
                                                    inputMode="numeric"
                                                    onChange={(e) => {
                                                      setService((prev) => {
                                                        let temp = { ...prev };
                                                        temp.questions[
                                                          q
                                                        ].answers[
                                                          a
                                                        ].additionalQuestions[
                                                          aq
                                                        ].answers[
                                                          aqa
                                                        ].timeToComplete =
                                                          e.target.value;
                                                        return temp;
                                                      });
                                                    }}
                                                  ></input>
                                                </div>

                                                <button
                                                  className="h-[1rem] w-[8rem] rounded-xl bg-red-600 pb-10 text-3xl transition-all duration-300 hover:bg-red-700 "
                                                  onClick={() => {
                                                    setService((prev) => {
                                                      let temp = { ...prev };
                                                      temp.questions[q].answers[
                                                        a
                                                      ].additionalQuestions[
                                                        aq
                                                      ].answers =
                                                        temp.questions[
                                                          q
                                                        ].answers[
                                                          a
                                                        ].additionalQuestions[
                                                          aq
                                                        ].answers.filter(
                                                          (Answer) =>
                                                            Answer !== answer
                                                        );
                                                      return temp;
                                                    });
                                                  }}
                                                >
                                                  -
                                                </button>
                                              </div>
                                            )
                                          )}
                                        <button
                                          className="h-[6rem] w-[13rem] rounded-xl bg-green-600 text-3xl transition-all duration-300 hover:bg-green-700 "
                                          onClick={() => {
                                            setService((prev) => {
                                              let temp = { ...prev };
                                              temp.questions[q].answers[
                                                a
                                              ].additionalQuestions[
                                                aq
                                              ].answers.push({
                                                answer: "",
                                                costIncrease: 0,
                                                _id: temp.questions[q].answers[
                                                  a
                                                ].additionalQuestions[aq]
                                                  .answers.length,
                                              });
                                              return temp;
                                            });
                                          }}
                                        >
                                          Additional Answer
                                        </button>
                                      </span>
                                    </div>
                                  )
                                )}
                              <button
                                className="h-[6rem] w-[13rem] rounded-xl bg-green-600 text-3xl transition-all duration-300 hover:bg-green-700"
                                onClick={() => {
                                  setService((prev) => {
                                    let temp = { ...prev };
                                    if (
                                      temp.questions[q].answers[a]
                                        .additionalQuestions === undefined
                                    ) {
                                      temp.questions[q].answers[
                                        a
                                      ].additionalQuestions = [
                                        {
                                          question: "",
                                          description: "",
                                          answers: [
                                            {
                                              answer: "",
                                              timeToComplete: 0,
                                              costIncrease: 0,
                                              _id: 0,
                                            },
                                          ],
                                          _id: 0,
                                        },
                                      ];
                                    } else {
                                      temp.questions[q].answers[
                                        a
                                      ].additionalQuestions.push({
                                        question: "",
                                        description: "",
                                        answers: [
                                          {
                                            answer: "",
                                            timeToComplete: 0,
                                            costIncrease: 0,
                                            _id: 0,
                                          },
                                        ],
                                        _id:
                                          temp.questions[q].answers[a]
                                            ?.additionalQuestions?.length | 0,
                                      });
                                    }

                                    return temp;
                                  });
                                }}
                              >
                                Additional Question
                              </button>
                            </div>
                          </div>
                        ))}
                      <button
                        className="h-[12.5rem] w-[11rem] rounded-xl bg-green-600 text-3xl transition-all duration-300 hover:bg-green-700"
                        onClick={() => {
                          setService((prev) => {
                            let temp = { ...prev };
                            temp.questions[q].answers.push({
                              answer: "",
                              timeToComplete: 0,
                              costIncrease: 0,
                              _id: temp.questions[q].answers.length,
                            });
                            return temp;
                          });
                        }}
                      >
                        Answer
                      </button>
                    </span>
                  </span>
                )}
              </div>
            ))}
          {!editMode && (
            <>
              {additionalQuestions &&
                additionalQuestions.map((additionalQuestion, aq) => (
                  <div key={additionalQuestion._id} className="mt-6">
                    <span className="relative mb-1 flex flex-row">
                      <h4 className="text-lg">{additionalQuestion.question}</h4>
                      <span className="group">
                        <h4 className="absolute right-0 border-spacing-3 cursor-help rounded-full border-2 border-ramsayBlue-0 px-2">
                          ?
                        </h4>
                        <span className="absolute left-0 top-8 z-10 hidden w-56 rounded-xl bg-ramsayBlue-0 py-2 transition-all duration-500 group-hover:block">
                          <p className="px-2">
                            {additionalQuestion.description}
                          </p>
                        </span>
                      </span>
                    </span>
                    <select
                      className="h-8 w-56 rounded-md text-black"
                      key={additionalQuestion._id}
                      _id={additionalQuestion._id}
                      id="additionalQuestion"
                      onChange={(e) =>
                        handleQuestionChange(additionalQuestion, e.target)
                      }
                    >
                      <option value="" key="">
                        Select
                      </option>
                      {additionalQuestion.answers.map((additionalAnswer) => (
                        <option
                          key={additionalAnswer._id}
                          value={additionalAnswer.costIncrease}
                          _id={additionalQuestion._id}
                          answer={additionalAnswer.answer}
                        >
                          {additionalAnswer.answer}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </>
          )}
          {editMode && (
            <button
              className="h-[6rem] w-full rounded-xl bg-green-600 text-3xl transition-all duration-300 hover:bg-green-700"
              onClick={() => {
                setService((prev) => {
                  let temp = { ...prev };
                  if (temp?.questions) {
                    temp.questions.push({
                      question: "",
                      description: "",
                      answers: [
                        {
                          answer: "",
                          timeToComplete: 0,
                          costIncrease: 0,
                          _id: 0,
                        },
                      ],
                      _id: temp.questions.length,
                    });
                  } else {
                    temp.questions = [
                      {
                        question: "",
                        description: "",
                        answers: [
                          {
                            answer: "",
                            timeToComplete: 0,
                            costIncrease: 0,
                            _id: 0,
                          },
                        ],
                        _id: 0,
                      },
                    ];
                  }

                  return temp;
                });
              }}
            >
              Question
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={async () => {
                  if (editMode) {
                    if (imageToUpload !== undefined) {
                      const image = await submitServiceImage();

                      if (service?.newService) {
                        let newServiceObject = service;
                        newServiceObject.localImageName = image;
                        newServiceObject.questions =
                          newServiceObject?.questions?.map((question) => {
                            question._id = undefined;
                            question?.answers?.map((answer) => {
                              answer._id = undefined;
                              answer?.additionalQuestions?.map((aq) => {
                                aq._id = undefined;
                                aq?.answers?.map((a) => {
                                  a._id = undefined;
                                  return a;
                                });
                                return aq;
                              });
                              return answer;
                            });
                            return question;
                          });
                        await newService(newServiceObject);
                        navigate(`/services`);
                        return;
                      } else {
                        let newServiceObject = service;
                        newServiceObject.localImageName = image;
                        await updateService(newServiceObject);
                      }
                    } else {
                      if (service?.newService) {
                        toast.error("Service Must Have An Image");
                        return;
                      } else {
                        await updateService(service);
                      }
                    }
                  } else {
                    cancel = service;
                  }
                  setEditMode(!editMode);
                }}
                className="absolute bottom-3 right-5 sm:right-10"
              >
                <FontAwesomeIcon icon={faPencilAlt} size="lg" />
              </button>
              <button
                className="absolute right-16 top-3 mb-1 sm:right-20"
                onClick={() => {
                  if (tempService?._id) {
                    setServiceToDelete(service);
                    setIsOpen(true);
                  } else {
                    setService({
                      newService: true,
                      title: "",
                      description: "",
                    });
                    navigate("/services");
                  }
                }}
              >
                <MdDeleteForever size={25} />
              </button>
              <DeleteServicePopup />
            </>
          )}
          {editMode && (
            <button
              onClick={() => {
                setEditMode(!editMode);
                setService(cancel.service);
                setImageToUpload(undefined);
              }}
              className="absolute bottom-3 right-16 sm:right-20"
            >
              Cancel
            </button>
          )}

          {!loggedIn && (
            <div className="mt-10 flex flex-col items-center gap-5 font-sans">
              <GoogleButton />
              <h1 className="w-64 text-center">
                Please Sign In With Google To Add Services To Your Cart
              </h1>
            </div>
          )}
          {service?.questions?.length + additionalQuestions?.length ===
            answeredQuestions?.length && !editMode ? (
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
