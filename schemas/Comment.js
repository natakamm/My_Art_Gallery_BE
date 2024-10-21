const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = Schema({
  content: {
    type: String,
    required: true,
    minLength: 1,
  },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
});

module.exports = mongoose.model("Comment", commentSchema);
