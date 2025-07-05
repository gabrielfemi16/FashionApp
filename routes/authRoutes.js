const express = require("express");
const router = express.Router();
const {
  login,
  register,
  loginPost,
  registerPost,
  logout,
  resetPassword,
  resetPasswordForm,
  forgotPassword,
} = require("../controllers/authController");

router.get("/login", login);
router.get("/register", register);

router.post("/login", loginPost);
router.post("/register", registerPost);

router.get("/logout", logout);

router.get("/forgot-password", (req, res) => {
  res.render("forgot-pass", { message: null });
});

router.post("/forgot-password", forgotPassword);
router.get("/reset-password", resetPasswordForm);
router.post("/reset-password", resetPassword);

module.exports = router;
