const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema = Schema({
  title: {
    type: String,
    required: true,
    minLength: 2,
  },
  description: {
    type: String,
    minLength: 1,
  },
  mainImage: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function (value) {
        return value && value.length > 0; // Ensures at least one image
      },
      message: "There must be at least one image in the images array.",
    },
  },

  user: { type: Schema.Types.ObjectId, ref: "User" }, //user who owns the project
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }], //array of user who liked the project
});

module.exports = mongoose.model("Project", projectSchema);
