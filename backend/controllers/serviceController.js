const ServiceModel = require("../models/serviceModel");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

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
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("oof", token);
      return res.status(401).json({ message: "not logged in" });
    }
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const adminToken = req.cookies.admin;
    const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
    const isAdmin = decodedAdminToken.isAdmin;
    if (isAdmin) {
      const { service } = req.body;
      // Check if the image exists
      const imagePath = path.join("./images", service.localImageName);
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: "Image does not exist" });
      }
      const newService = await Service.create(service);
      newService.save();
      return res.status(200).json({ newService });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const id = req.params.id;
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "not logged in" });
    }
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const adminToken = req.cookies.admin;
    const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
    const isAdmin = decodedAdminToken.isAdmin;
    if (isAdmin) {
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
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "not logged in" });
    }
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const adminToken = req.cookies.admin;
    const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
    const isAdmin = decodedAdminToken.isAdmin;
    if (isAdmin) {
      const { service } = req.body;
      const updatedService = await Service.findByIdAndUpdate(
        service._id,
        service,
        {
          new: true,
          runValidators: true,
        }
      );

      if (updatedService) {
        return res.status(200).send(updatedService);
      } else {
        return res.status(404).json({ message: "Service not found" });
      }
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getServices,
  createService,
  deleteService,
  updateService,
};
