const mongoose = require("mongoose");
const { Schema } = mongoose;

const blogSchema = Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxLength: 150,
    },
    content: {
      type: String,
      required: true,
      minlength: 25,
    },
    mainImage: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
    },
    user: { type: Schema.Types.ObjectId, ref: "User" }, //user who owns the blog post
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
