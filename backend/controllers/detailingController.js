const Detailing = require('../models/detailingModel')
const mongoose = require('mongoose')

const getDetailings = async (req, res) => {
    const detailings = await Detailing.find({}).sort({createdAt: -1})

    res.status(200).json(detailings)
}

const getDetailingById = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'No such detailing'})
    }

    const detailing = await Detailing.findById(id)

    if (!detailing) {
        return res.status(404).json({error: 'No such detailing'})
    }

    res.status(200).json(detailing)
}

const createDetailing = async (req, res) => {
    try {
        const detailing = await Detailing.create({ ...req.body })
        res.status(200).json(detailing)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
}

const updateDetailing = async (req, res) => {
    const { id } = req.params
    try {
      const detailing = await Detailing.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true }
      )
      res.status(200).json(detailing)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
}

const deleteDetailing = async (req, res) => {
    const { id } = req.params
    try {
        const detailing = await Detailing.findByIdAndDelete(id)
        res.status(200).json(detailing)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
}

module.exports = {
    getDetailingById,
    getDetailings,
    createDetailing,
    deleteDetailing,
    updateDetailing
}


