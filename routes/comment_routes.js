const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const checkOwnership = require("../middlewares/checkOwnership");
const {
  getAllCommentsOnProject,
  getYourCommentsOnProject,
  getAllYourComments,
  editComment,
  deleteYourComment,
  deleteCommentOnOwnProject,
  createComment,
} = require("../controllers/comment_controller");
const Project = require("../schemas/Project");
const Comment = require("../schemas/Comment");

const app = express.Router();

//public routes
app.get("/:projectId", getAllCommentsOnProject);

// Authenticated user-specific routes
app.use(requireAuth);
app.get("/your", getAllYourComments);
app.get("/your/:projectId", getYourCommentsOnProject);
app.post("/create/:projectId", createComment);

// Routes for modifying the user's own comments or comments on user´s projects (use checkOwn middleware)
app.put("/:commentId", checkOwnership(Comment, "comment"), editComment);
app.delete(
  "/:commentId",
  checkOwnership(Comment, "comment"),
  deleteYourComment
);

app.delete(
  "/projects/:projectId/comments/:commentId",
  checkOwnership(Project, "project"), // Check project ownership
  deleteCommentOnOwnProject
);

module.exports = app;
