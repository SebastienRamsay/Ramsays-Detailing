const express = require("express");
const {
  getUserInfo,
  updateEmployeeInfo,
  requestUpdateEmployeeInfo,
  getAllUserInfo,
  updateEmplyeeStatus,
  updateEmployeeSchedule,
} = require("../controllers/userController");

const router = express.Router();

router.get("/info", getUserInfo);

router.get("/admin/info", getAllUserInfo);

router.patch("/employee", updateEmplyeeStatus);

router.patch("/employee/info/schedule", updateEmployeeSchedule);

router.patch("/employee/info", updateEmployeeInfo);

router.patch("/employee/info/request", requestUpdateEmployeeInfo);

module.exports = router;
