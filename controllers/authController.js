const validator = require("validator");
const User = require("../models/user");
const CryptoJS = require("crypto-js");
const JWT = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.codebadgertech.com",
  port: 465,
  auth: {
    user: "training@codebadgertech.com",
    pass: "training@30",
  },
});

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("forgot-password", { message: "User not found" });
    }

    const expires = Date.now() + 5 * 60 * 1000;
    const tokenData = `${user._id}.${expires}`;
    const token = CryptoJS.AES.encrypt(tokenData, "your_secret_key").toString();

    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/reset-password?token=${encodeURIComponent(token)}`;

    const mailOptions = {
      from: "training@codebadgertech.com",
      to: user.email,
      subject: "Password Reset",
      html: `
        <div style="max-width: 500px; margin: auto; padding: 20px; border-radius: 8px; background: #f9f9f9; border: 1px solid #e0e0e0; font-family: Arial, sans-serif;">
          <h2 style="color: #1a73e8; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            We received a request to reset your password. Click the button below to reset it. This link is valid for 5 minutes.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="padding: 12px 20px; background-color: #1a73e8; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #555;">
            If you did not request this, please ignore this email.
          </p>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Your Fashion App. All rights reserved.
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error(err);
      else console.log(info.response);
    });

    res.render("forgot-pass", { message: "Reset link sent to your email" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

const resetPasswordForm = (req, res) => {
  const { token } = req.query;
  res.render("reset-pass", { token });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decrypted = CryptoJS.AES.decrypt(token, "your_secret_key").toString(
      CryptoJS.enc.Utf8
    );
    const [userId, expires] = decrypted.split(".");
    if (Date.now() > Number(expires)) {
      return res.send("Reset link has expired");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.send("User not found");
    }

    // Encrypt the new password before saving
    user.password = encryptPassword(newPassword);
    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.send("Invalid or expired reset link");
  }
};

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

    // ✅ Send Welcome Email after successful registration
    const mailOptions = {
      from: "training@codebadgertech.com",
      to: savedUser.email,
      subject: "Welcome to Fashion App!",
      html: `
        <div style="max-width: 500px; margin: auto; padding: 20px; border-radius: 8px; background: #f9f9f9; border: 1px solid #e0e0e0; font-family: Arial, sans-serif;">
          <h2 style="color: #1a73e8; text-align: center;">Welcome to Your Fashion App!</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            Hello <strong>${savedUser.username}</strong>,<br><br>
            Thank you for signing up! We're excited to have you join our fashion community. Explore the latest products, create your wishlist, and enjoy shopping.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${req.protocol}://${req.get(
        "host"
      )}/" style="padding: 12px 20px; background-color: #1a73e8; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Visit Our Store
            </a>
          </div>
          <p style="font-size: 14px; color: #555;">
            If you have any questions, feel free to reply to this email. Happy shopping!
          </p>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Your Fashion App. All rights reserved.
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Error sending welcome email:", err);
      else console.log("Welcome email sent:", info.response);
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
  logout,
  forgotPassword,
  resetPasswordForm,
  resetPassword,
};
