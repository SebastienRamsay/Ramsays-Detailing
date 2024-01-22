const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const refreshUserToken = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.SECRET, {
      ignoreExpiration: true,
    });
    const { userID } = decoded;

    req.user = await User.findOne({ _id: userID }).select("_id");

    // Refresh the user token
    const newUserToken = jwt.sign({ userID }, process.env.SECRET, {
      expiresIn: "1h",
    });

    // Send the new user token to the client
    res.cookie("token", newUserToken, {
      httpOnly: true,
      secure: true,
    });

    req.cookies.token = newUserToken;

    return newUserToken;
  } catch (error) {
    // user is not logged in
    return null;
  }
};

const refreshAdminToken = async (req, res) => {
  try {
    const adminToken = req.cookies.admin;
    const decodedAdmin = jwt.verify(adminToken, process.env.SECRET, {
      ignoreExpiration: true,
    });

    const { isAdmin } = decodedAdmin;

    // Refresh the admin token
    const newAdminToken = jwt.sign({ isAdmin }, process.env.SECRET, {
      expiresIn: "1h",
    });

    res.cookie("admin", newAdminToken, {
      httpOnly: true,
      secure: true,
    });

    req.cookies.admin = newAdminToken;

    return newAdminToken;
  } catch (error) {
    //user is not an admin
    return null;
  }
};

const requireAuth = async (req, res, next) => {
  try {
    const userToken = await refreshUserToken(req, res);
    var adminToken;
    try {
      adminToken = refreshAdminToken(req, res);
    } catch (error) {
      // user is not an admin
    }

    if (userToken || adminToken) {
      // At least one of the tokens was successfully refreshed
      next();
    } else {
      // No token was refreshed; return unauthorized
      return res.status(401).json({ error: "Request is not authorized" });
    }
  } catch (error) {
    console.log("Error in requireAuth middleware:", error);
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = { requireAuth, refreshUserToken, refreshAdminToken };
