require("dotenv").config();
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
// const encrypt = require("mongoose-encryption");
const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String,
});

// const secret = process.env.secret;
// userSchema.plugin(encrypt, {
//   secret: secret,
//   encryptedFields: ["password"],
// });
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
module.exports = mongoose.model("User", userSchema);
