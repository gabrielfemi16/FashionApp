const jwt = require("jsonwebtoken");
const User = require("../models/user");

const setUserLocals = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;
    if (!token) {
      res.locals.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      res.locals.user = {
        username: user.username,
        isAdmin: user.isAdmin,
        image: user.image,
      };
    } else {
      res.locals.user = null;
    }

    next();
  } catch (error) {
    console.error("Error in setUserLocals middleware:", error);
    res.locals.user = null;
    next();
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;

    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.redirect("/login");
    }

    if (!user.isAdmin) {
      return res.redirect("/");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    return res.redirect("/login");
  }
};

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;
    if (!token) return res.redirect("/login");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.redirect("/login");

    req.user = user;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
};

module.exports = {
  setUserLocals,
  isAdmin,
  isAuthenticated,
};
