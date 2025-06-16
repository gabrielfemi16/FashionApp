const express = require("express");
const router = express.Router();
const {
  login,
  register,
  loginPost,
  registerPost,
  logout,
} = require("../controllers/authController");

router.get("/login", login);
router.get("/register", register);

router.post("/login", loginPost);
router.post("/register", registerPost);

router.get("/logout", logout);

module.exports = router;
