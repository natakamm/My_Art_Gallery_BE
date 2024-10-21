const jwt = require("jsonwebtoken");

const createToken = (_id, username) => {
  return jwt.sign({ _id, username }, process.env.SECRET, { expiresIn: "1d" });
};

module.exports = createToken;
