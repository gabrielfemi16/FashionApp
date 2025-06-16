const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { setUserLocals } = require("./middlewares/auth");
const port = 1000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

dotenv.config();

app.use(cookieParser());

app.use(express.static("public"));

app.set("view engine", "ejs");

const URL = process.env.URI;

const connectToDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log("connected to db successfully");
  } catch (err) {
    console.error(err);
  }
};
connectToDB();

app.use(setUserLocals);

app.use(authRoutes);
app.use(userRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404 Not Found" });
});

app.listen(port, () => {
  console.log(`Listening to request at port ${port}`);
});
