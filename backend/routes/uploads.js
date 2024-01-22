const express = require("express");
const {
  uploadBeforePicture,
  uploadAfterPicture,
  deleteBeforePicture,
  deleteAfterPicture,
  uploadServicePicture,
} = require("../controllers/uploadController");

const router = express.Router();

router.post("/service", uploadServicePicture);

router.post("/before", uploadBeforePicture);

router.post("/after", uploadAfterPicture);

router.delete("/before", deleteBeforePicture);

router.delete("/after", deleteAfterPicture);

module.exports = router;
