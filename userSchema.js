const mongoose = require("mongoose");
const judge = require("validator");

const userdata = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "please put in your name"],
  },

  username: {
    type: String,
    required: [true, "please put in your last name"],
    unique: [true, "use a unique username"],
  },

  email: {
    type: String,
    required: [true, "please put in an email"],
    unique: true,
    validate: [judge.isEmail, "please put in a valid email address"],
  },

  birthday: {
    type: Date,
    required: [true, "please put in your birthday"],
  },
});

const USER = new mongoose.model("USER", userdata);
module.exports = USER