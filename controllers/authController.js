const validator = require("validator");
const User = require("../models/user");
const CryptoJS = require("crypto-js");
const JWT = require("jsonwebtoken");

const encryptPassword = (psw) => {
  return CryptoJS.AES.encrypt(psw, process.env.PASS_SEC).toString();
};

const decryptPassword = (psw) => {
  return CryptoJS.AES.decrypt(psw, process.env.PASS_SEC).toString(
    CryptoJS.enc.Utf8
  );
};

const login = (req, res) => {
  res.render("auth/login", { title: "Login" });
};

const register = (req, res) => {
  res.render("auth/register", { title: "Register" });
};

const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not registered" });
    }

    const decryptedPassword = decryptPassword(user.password);
    if (decryptedPassword !== password) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const accessToken = JWT.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const maxAge = 86400;
    res.cookie("jwtToken", accessToken, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });

    return res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const registerPost = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Email is not valid" });
    }

    const isEmailExisting = await User.findOne({ email });
    if (isEmailExisting) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const newUser = new User({
      username,
      email,
      password: encryptPassword(password),
    });

    const savedUser = await newUser.save();

    const accessToken = JWT.sign(
      { id: savedUser._id, isAdmin: savedUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("jwtToken", accessToken, {
      httpOnly: true,
      maxAge: 86400 * 1000,
    });

    return res.status(200).json({ message: "Signup successful!" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("jwtToken");
  return res.redirect("/login");
};

module.exports = {
  login,
  register,
  loginPost,
  registerPost,
  logout
};
