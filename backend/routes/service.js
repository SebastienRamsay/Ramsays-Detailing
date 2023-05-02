const express = require('express')
const {
    getServices,
    createService,
    deleteService,
    updateService
} = require('../controllers/serviceController')

const router = express.Router()

router.post('/', createService)

router.patch('/:id', updateService)

router.get('/', getServices)

router.delete('/:id', deleteService)

module.exports = router