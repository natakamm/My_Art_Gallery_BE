const jwt = require("jsonwebtoken");
const User = require("../schemas/User");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    console.error("No authorization found!");
    return res.status(401).json({ error: "Not Authorized!" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET); // Use _id as per your decoded token
    console.log("Decoded ID from token:", _id); // Log the decoded ID

    req.user = await User.findById(_id).select("_id");
    console.log("User found:", req.user); // Log the found user

    if (!req.user) {
      return res.status(404).json({ error: "User not found." });
    }

    next();
    console.log("Authorization successful, proceeding to the next middleware.");
  } catch (error) {
    console.log("Token verification error:", error); // Log the verification error
    res.status(401).json({ error: "Not Authorized." });
  }
};

module.exports = requireAuth;
