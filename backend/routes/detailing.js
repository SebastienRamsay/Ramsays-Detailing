const express = require('express')

const {
    getDetailingById,
    getDetailings,
    createDetailing,
    deleteDetailing,
    updateDetailing
} = require('../controllers/detailingController')

const router = express.Router()

router.post('/', createDetailing)

router.patch('/:id', updateDetailing)

router.get('/', getDetailings)

router.get('/:id', getDetailingById)

router.delete('/:id', deleteDetailing)

module.exports = router