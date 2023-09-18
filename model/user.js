require("dotenv").config();
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// const secret = process.env.secret;
// userSchema.plugin(encrypt, {
//   secret: secret,
//   encryptedFields: ["password"],
// });
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
