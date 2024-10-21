const Comment = require("../schemas/Comment");
const Project = require("../schemas/Project");

//get all comments on one project
const getAllCommentsOnProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const comments = await Comment.find({ project: projectId }).populate(
      "user",
      "username avatar"
    );

    if (!comments.length) {
      return res.status(200).json({ message: "No comments yet." });
    }

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get your own comments on a project
const getYourCommentsOnProject = async (req, res) => {
  const userId = req.user._id;
  const { projectId } = req.params;

  try {
    const comments = await Comment.find({
      user: userId,
      project: projectId,
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get All your comments
const getAllYourComments = async (req, res) => {
  const userId = req.user._id;

  try {
    const comments = await Comment.find({
      user: userId,
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//edit a comment you have made
const editComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  const { content } = req.body;

  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, user: userId },
      { content },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or you don't have permission to edit this.",
      });
    }

    res.status(200).json({ message: "Comment updated successfully.", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete a comment you have made
const deleteYourComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      user: userId,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or you don't have permission to edit this.",
      });
    }

    await Project.findByIdAndUpdate(
      comment.project,
      { $pull: { comments: commentId } },
      { new: true }
    );

    res.status(200).json({ message: "Comment deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a comment from a project
const deleteCommentOnOwnProject = async (req, res) => {
  const { commentId } = req.params;

  try {
    // Find the comment by its ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found.",
      });
    }

    await Project.findByIdAndUpdate(
      comment.project,
      { $pull: { comments: commentId } },
      { new: true }
    );

    // Proceed to delete the comment
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//create a comment on a project, can also be yours
const createComment = async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    return res.status(400).json({ message: "The comment needs content." });
  }

  try {
    const comment = await Comment.create({
      content,
      user: userId,
      project: projectId,
    });

    await Project.findByIdAndUpdate(
      projectId,
      { $push: { comments: comment._id } }, // Add the comment ID to the comments array
      { new: true } // Return the updated document
    );

    res.status(201).json({ message: "Comment added successfully.", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCommentsOnProject,
  getYourCommentsOnProject,
  getAllYourComments,
  editComment,
  deleteYourComment,
  deleteCommentOnOwnProject,
  createComment,
};
