//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
const port = 3000;
const md5 = require("md5");

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlParser: true,
});

const User = require("./model/user");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", async function (req, res) {
  try {
    const { username, password } = req.body;

    const isLogin = await User.findOne({ email: username });

    if (isLogin.password === password) {
      res.render("secrets");
    } else {
      res.redirect("/");
    }
  } catch (error) {}
});
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  try {
    const { username, password } = req.body;
    //console.log(req.body);
    const user = new User({
      email: username,
      password: md5(password),
    });
    const savedUser = await user.save();
    console.log("Register successfully :" + savedUser);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log("Starting server on port " + port);
});
