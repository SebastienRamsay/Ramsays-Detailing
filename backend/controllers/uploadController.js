const fs = require("fs");
const multer = require("multer");
const mime = require("mime-types");
const Booking = require("../models/bookingModel.js");
const jwt = require("jsonwebtoken");

const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png"]; // Add more image types as needed

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Allow the upload
  } else {
    cb(new Error("Only image files are allowed!"), false); // Reject the upload
  }
};

// Define storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const bookingID = req.query.bookingID; // Get user ID from the request body
    const userUploadPath = `./images/${bookingID}`; // Update the path with bookingID
    if (!fs.existsSync(userUploadPath)) {
      fs.mkdirSync(userUploadPath, { recursive: true }); // Create user directory if it doesn't exist
    }
    cb(null, userUploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Use a timestamp and original filename
  },
});

const upload = multer({
  storage,
  fileFilter: imageFilter,
}).array("images", 6);

// Handle file upload
const uploadBeforePicture = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "not logged in" });
    }
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const bookingID = req.query.bookingID;
    var booking = await Booking.findById(bookingID);

    if (booking.employeeId !== userID) {
      return res
        .status(401)
        .json({ message: "You haven't claimed this booking" });
    }
    upload(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: "Error uploading files" });
      }

      // Handle file upload success here
      const imageNames = req.files.map((file) => file.filename);

      booking.beforePictures.push(...imageNames);
      booking.save();

      res.json({ imageNames: booking.beforePictures });
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "No Images To Upload" });
  }
};

// Handle file upload
const uploadAfterPicture = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "not logged in" });
    }
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const bookingID = req.query.bookingID;
    var booking = await Booking.findById(bookingID);

    if (booking.employeeId !== userID) {
      return res
        .status(401)
        .json({ message: "You haven't claimed this booking" });
    }

    upload(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: "Error uploading files" });
      }

      // Handle file upload success here
      const imageNames = req.files.map((file) => file.filename);
      booking.afterPictures.push(...imageNames);
      booking.save();

      res.json({ imageNames: booking.afterPictures });
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "No Images To Upload" });
  }
};

const deleteBeforePicture = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "not logged in" });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const bookingID = req.query.bookingID;
    const booking = await Booking.findById(bookingID);

    if (booking.employeeId !== userID) {
      try {
        const adminToken = req.cookies.admin;
        const decodedToken = jwt.verify(adminToken, process.env.SECRET);
        const isAdmin = decodedToken.isAdmin;
        if (!isAdmin) {
          return res
            .status(401)
            .json({ message: "You haven't claimed this booking" });
        }
      } catch (error) {
        return res
          .status(401)
          .json({ message: "You haven't claimed this booking" });
      }
    }

    const imageName = req.query.imageName;
    const filePath = `./images/${bookingID}/${imageName}`;
    console.log(filePath);

    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlink(filePath, async (err) => {
        if (err) {
          res.status(400).send(`Error deleting file: ${err}`);
        } else {
          // Remove the deleted image name from the booking's beforePictures array
          booking.beforePictures = booking.beforePictures.filter(
            (pic) => pic !== imageName
          );

          await booking.save(); // Save the updated booking object

          res.send("File deleted successfully");
        }
      });
    } else {
      res.status(400).send("File does not exist");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const deleteAfterPicture = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "not logged in" });
    }
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const bookingID = req.query.bookingID;

    const booking = await Booking.findById(bookingID);

    if (booking.employeeId !== userID) {
      try {
        const adminToken = req.cookies.admin;
        const decodedToken = jwt.verify(adminToken, process.env.SECRET);
        const isAdmin = decodedToken.isAdmin;
        if (!isAdmin) {
          return res
            .status(401)
            .json({ message: "You haven't claimed this booking" });
        }
      } catch (error) {
        return res
          .status(401)
          .json({ message: "You haven't claimed this booking" });
      }
    }

    const imageName = req.query.imageName;
    const filePath = `./images/${bookingID}/${imageName}`;
    console.log(filePath);

    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlink(filePath, async (err) => {
        if (err) {
          res.status(400).send(`Error deleting file: ${err}`);
        } else {
          // Remove the deleted image name from the booking's beforePictures array
          booking.afterPictures = booking.afterPictures.filter(
            (pic) => pic !== imageName
          );

          await booking.save(); // Save the updated booking object

          res.send("File deleted successfully");
        }
      });
    } else {
      res.status(400).send("File does not exist");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  deleteAfterPicture,
  deleteBeforePicture,
  uploadAfterPicture,
  uploadBeforePicture,
};
