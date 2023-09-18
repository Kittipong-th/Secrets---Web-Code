//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const User = require("./model/user");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: false, // This makes the cookie a session cookie
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlParser: true,
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", function (req, res) {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    if (!req.user) {
      // Authentication failed or user not found, handle accordingly
      return res.redirect("/error");
    }
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.get("/login", function (req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets", // Redirect to secrets on successful login
    failureRedirect: "/login", // Redirect to login on failed login
  })
);

app.get("/secrets", async function (req, res) {
  try {
    const foundUsers = await User.find({ secret: { $ne: null } }).exec();
    if (foundUsers) {
      res.render("secrets", { usersWithSecrets: foundUsers });
    }
  } catch (err) {
    console.log(err);
    // Handle the error appropriately, e.g., render an error page or redirect
    res.redirect("/error");
  }
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  const { username, password } = req.body;
  User.register({ username: username }, password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", async function (req, res) {
  const { secret } = req.body;
  console.log(req.user.id);

  try {
    const foundUser = await User.findById(req.user.id);
    if (foundUser) {
      foundUser.secret = secret;
      await foundUser.save();
      res.redirect("/secrets");
    } else {
      console.log("User not found");
      // Handle the case where the user is not found
    }
  } catch (err) {
    console.log(err);
    // Handle the error appropriately, e.g., render an error page or redirect
    res.redirect("/error");
  }
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log("Starting server on port " + port);
});
