const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 1,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Invalid email."],
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
    default:
      "https://cdn.myportfolio.com/c728a553-9706-473c-adca-fa2ea3652db5/dfc91b3a-2282-4570-8e73-f71eedaa3ba1_rw_1200.jpg?h=3c291787e4a9e913b367241e1e2d5839",
  },
  favorites: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  savedBlogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
  isActive: {
    type: Boolean,
    default: true,
  },
});

userSchema.statics.signup = async function (email, password, username) {
  const emailExists = await this.findOne({ email, isActive: true });
  const usernameExists = await this.findOne({ username, isActive: true });

  if (emailExists) {
    throw Error("Email already in use.");
  }

  if (usernameExists) {
    throw Error("Username is already taken.");
  }

  if (!email || !password || !username) {
    throw Error("All fields must be filled.");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid.");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error(
      "Make sure to use at least 8 characters, one upper case letter, a number and a symbol."
    );
  }

  const salt = await bcrypt.genSalt(10);

  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ username, email, password: hash });

  return user;
};

userSchema.statics.login = async function (identifier, password) {
  if (!identifier || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({
    $or: [{ username: identifier }, { email: identifier }],
    isActive: true,
  });

  if (!user) {
    throw Error("Incorrect username or email.");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
