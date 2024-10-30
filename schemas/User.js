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
    const error = Error("Email already in use.");
    error.status = 400;
    throw error;
  }

  if (usernameExists) {
    const error = Error("Username is already taken.");
    error.status = 400;
    throw error;
  }

  if (!email || !password || !username) {
    const error = Error("All fields must be filled.");
    error.status = 400;
    throw error;
  }

  if (!validator.isEmail(email)) {
    const error = Error("Email is not valid.");
    error.status = 400;
    throw error;
  }

  if (!validator.isStrongPassword(password)) {
    const error = Error(
      "Make sure to use at least 8 characters, one upper case letter, a number and a symbol."
    );
    error.status = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);

  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ username, email, password: hash });

  return user;
};

userSchema.statics.login = async function (identifier, password) {
  if (!identifier || !password) {
    const error = new Error("All fields must be filled");
    error.status = 400; // Bad Request
    throw error;
  }

  const user = await this.findOne({
    $or: [{ username: identifier }, { email: identifier }],
    isActive: true,
  });

  if (!user) {
    const error = new Error("Incorrect username or email.");
    error.status = 401; // Unauthorized
    throw error;
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    const error = new Error("Incorrect password");
    error.status = 401; // Unauthorized
    throw error;
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
