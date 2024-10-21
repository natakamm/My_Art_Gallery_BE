const express = require("express");
const upload = require("../services/upload");
const requireAuth = require("../middlewares/requireAuth");
const {
  loginUser,
  signUpUser,
  getUser,
  getAllUsers,
  editAvatar,
  editUserDetails,
  getOtherUser,
  deleteUser,
} = require("../controllers/user_controllers");

const app = express.Router();

// Public routes (no authentication required)
app.post("/login", loginUser);
app.post("/signup", signUpUser);
app.get("/all", getAllUsers);
app.get("/:userId", getOtherUser);

// Protected routes (authentication required)
app.use(requireAuth); // Apply the middleware here to protect the following routes
app.get("/", getUser);
app.put("/profile/avatar", upload.single("avatar"), editAvatar);
app.put("/profile/details", editUserDetails);
app.delete("/delete-account", deleteUser);

module.exports = app;
