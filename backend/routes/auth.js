const router = require("express").Router();

const {
  logout,
  protected,
  googleAuthCallback,
  googleAuth,
  adminAuth,
  loggedIn,
  googleAuthFail,
} = require("../controllers/authController");

router.get("/LoggedIn", loggedIn);

router.post("/auth/admin", adminAuth);

router.get("/auth/google", googleAuth);

router.get("/auth/google/callback", googleAuthCallback);

router.get("/protected", protected);

router.get("/logout", logout);

router.get("/auth/google/failure", googleAuthFail);

module.exports = router;
