const Blog = require("../schemas/Blog");
const User = require("../schemas/User");

const getYourBlogs = async (req, res) => {
  const userId = req.user._id;

  try {
    const blogs = await Blog.find({ user: userId }).populate({
      path: "user",
      select: "username avatar",
    });
    if (!blogs.length) {
      return res.status(200).json({ message: "You have no blogs yet." });
    }
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOneOfYourBlogs = async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  try {
    const blog = await Blog.findOne({
      _id: blogId,
      user: userId,
    }).populate({
      path: "user",
      select: "username avatar",
    });

    if (!blog) {
      return res.status(403).json({
        message: "Blog not found or you don't have permission to access it.",
      });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOneBlog = async (req, res) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).populate({
      path: "user",
      match: { isActive: true }, // Ensure the user is active
      select: "username avatar isActive",
    });

    if (!blog || !blog.user) {
      return res
        .status(404)
        .json({ message: "Blog was not found or user is inactive." });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  try {
    const blogs = await Blog.find()
      .limit(limit * 1) // multiply by 1 to ensure 'limit' is a number
      .skip((page - 1) * limit)
      .populate({
        path: "user",
        match: { isActive: true }, // Only populate active users
        select: "username avatar isActive",
      });

    if (!blogs.length) {
      return res
        .status(200)
        .json({ message: "There are no active blogs here yet." });
    }

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTitleAndContent = async (req, res) => {
  const { blogId } = req.params;
  const { content, title } = req.body;

  try {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { content, title },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    res.status(200).json({ message: "Blog successfully updated.", blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMainImage = async (req, res) => {
  const { blogId } = req.params;
  const mainImage = req.file ? req.file.path : null;

  try {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { mainImage },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }
    res.status(200).json({ message: "Main Image successfully updated.", blog });
  } catch (error) {
    console.error("Error updating main image:", error);
    res.status(500).json({ error: error.message });
  }
};

const addImagesToGallery = async (req, res) => {
  const { blogId } = req.params;
  const images = req.files.images
    ? req.files.images.map((file) => file.path)
    : [];

  console.log(req.files); // Log files to see what was uploaded

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      console.log("Not found.");
      return res.status(404).json({ message: "Blog not found." });
    }

    if (images.length > 0) {
      blog.images.push(...images); // Add images to the blog
    }

    await blog.save(); // Save the updated blog
    res.status(200).json({ message: "Images added successfully.", blog });
  } catch (error) {
    console.error("Error adding images:", error);
    res.status(500).json({ error: error.message });
  }
};

const removeImagesFromGallery = async (req, res) => {
  const { blogId } = req.params;
  const { images } = req.body;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }
    console.log("Current images in blog:", blog.images);
    console.log("Images to remove:", images);
    if (Array.isArray(images) && images.length > 0) {
      blog.images = blog.images.filter((img) => !images.includes(img));
      console.log("Updated images in blog after removal:", blog.images);
    } else {
      console.log("Error here");
    }
    await blog.save();
    res.status(200).json({ message: "Images removed successfully.", blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) {
      return res.status(400).json({ message: "Blog not found." });
    }
    res.status(200).json({ message: "Blog has been deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBlog = async (req, res) => {
  const { title, content } = req.body;
  const mainImage =
    req.files && req.files.mainImage ? req.files.mainImage[0].path : null;
  const images =
    req.files && req.files.images
      ? req.files.images.map((file) => file.path)
      : [];

  let emptyFields = [];

  if (!title) {
    emptyFields.push("title");
  }
  if (!content) {
    emptyFields.push("content");
  }
  if (!mainImage) {
    emptyFields.push("mainImage");
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill all fields", emptyFields });
  }

  try {
    const userId = req.user._id;
    const blog = await Blog.create({
      title,
      content,
      mainImage,
      images,
      user: userId,
    });
    return res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveBlog = async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const blog = await Blog.findById(blogId);

    if (userId.toString() === blog.user.toString()) {
      return res
        .status(403)
        .json({ message: "You can´t save your own blog posts." });
    }

    if (!user.savedBlogs.includes(blogId)) {
      user.savedBlogs.push(blogId);
      await user.save();
    } else {
      return res
        .status(403)
        .json({ message: "You already have saved this blog." });
    }

    res.status(200).json({ message: "Blog saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unsaveBlog = async (req, res) => {
  const userId = req.user._id;
  const { blogId } = req.params;

  try {
    await User.findByIdAndUpdate(
      userId,
      { $pull: { savedBlogs: blogId } },
      { new: true }
    );

    res.status(200).json({ message: "Blog removed from saved list!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getYourBlogs,
  getOneOfYourBlogs,
  getOneBlog,
  getAllBlogs,
  updateTitleAndContent,
  updateMainImage,
  addImagesToGallery,
  removeImagesFromGallery,
  deleteBlog,
  createBlog,
  unsaveBlog,
  saveBlog,
};
