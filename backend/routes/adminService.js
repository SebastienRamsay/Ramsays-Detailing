const express = require("express");
const {
  createService,
  deleteService,
  updateService,
} = require("../controllers/serviceController");

const router = express.Router();

router.post("/", createService);

router.patch("/", updateService);

router.delete("/:id", deleteService);

module.exports = router;
