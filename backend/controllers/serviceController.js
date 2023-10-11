const ServiceModel = require("../models/serviceModel");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Service = ServiceModel.Service;
const Question = ServiceModel.Question;

const getServices = async (req, res) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createService = async (req, res) => {
  const { localImageName, title, description, timeToComplete, questions } =
    req.body;
  const questionSchemaArray = [];

  // Check if the image exists
  const imagePath = path.join("./images", localImageName);
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Image does not exist" });
  }

  if (questions) {
    questions.forEach((info) => {
      const answerSchemaArray = info.answers.map((answer) => ({
        answer: answer.answer,
        costIncrease: answer.costIncrease,
        additionalQuestions: answer.additionalQuestions,
      }));

      const questionSchema = {
        question: info.question,
        answers: answerSchemaArray,
      };

      questionSchemaArray.push(questionSchema);
    });
  }

  try {
    const service = await Service.create({
      localImageName,
      title,
      description,
      timeToComplete,
      questions: questionSchemaArray,
    });

    res.status(200).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such service" });
    }

    const deletedService = await Service.findByIdAndDelete(id);

    if (deletedService) {
      res.status(200).json({
        message: "Service deleted successfully",
        deletedService,
      });
    } else {
      res.status(404).json({
        message: "Service not found",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { localImageName, title, description, timeToComplete, questions } =
    req.body;
  const questionSchemaArray = [];

  if (questions) {
    questions.forEach((info) => {
      const answerSchemaArray = info.answers.map((answer) => ({
        answer: answer.answer,
        costIncrease: answer.costIncrease,
      }));

      const questionSchema = {
        question: info.question,
        answers: answerSchemaArray,
      };

      questionSchemaArray.push(questionSchema);
    });
  }

  try {
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        localImageName,
        title,
        description,
        timeToComplete,
        questions: questionSchemaArray,
      },
      { new: true, runValidators: true }
    );

    if (updatedService) {
      res.status(200).json(updatedService);
    } else {
      res.status(404).json({ message: "Service not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getServices,
  createService,
  deleteService,
  updateService,
};
