const ServiceModel = require('../models/serviceModel')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')

const Service = ServiceModel.Service
const Question = ServiceModel.Question

const getServices = async (req, res) => {
    const services = await Service.find({}).sort({createdAt: -1})

    res.status(200).json(services)
}

const createService = async (req, res) => {
    const { localImageName, title, price, questions } = req.body
    const questionSchemaArray = []

    const imageDirectory = './images/';
    const imagePath = imageDirectory + localImageName

    try {
        await fs.promises.access(imagePath, fs.constants.F_OK);
    } catch (error) {
        console.error(imagePath, " does not exist.\n", error);
        return res.status(404).json({ error: "Image does not exist"})
    }

    questions.forEach(info => {
        const questionSchema = new Question({
            question: info.question,
            answers: info.answers
        })
        questionSchemaArray.push(questionSchema)
    })

    try {
        const service = await Service.create({
            localImageName,
            title,
            price,
            questions: questionSchemaArray
        })
        res.status(200).json(service)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const deleteService = async (req, res) => {

    try {

        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({error: 'No such service'})
        }

        const deletedService = await Service.findByIdAndDelete(id)

        if (deletedService) {
            res.status(200).json({
                message: 'Service deleted successfully',
                deletedService
            })
        } else {
            res.status(404).json({
                message: 'Service not found'
            })
        }

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

const updateService = async (req, res) => {
    const { id } = req.params;
    const { localImageName, title, price, questions } = req.body;
    const questionSchemaArray = [];
    if (questions){
        questions.forEach(info => {
        const questionSchema = new Question({
            question: info.question,
            answer: info.answers
        });
        questionSchemaArray.push(questionSchema);
        });
    }
    
  
    try {
        if (questions){
            var service = await Service.findByIdAndUpdate(
                id,
                {questions: questionSchemaArray },
                { new: true, runValidators: true }
            );
        }else{
            var service = await Service.findByIdAndUpdate(
                id,
                {questions: questionSchemaArray },
                { new: true, runValidators: true }
            );
        }
        res.status(200).json(service);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  

module.exports = {
    getServices,
    createService,
    deleteService,
    updateService
}



