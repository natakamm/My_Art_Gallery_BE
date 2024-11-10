const Project = require("../schemas/Project");
const User = require("../schemas/User");

const getYourProjects = async (req, res) => {
  const userId = req.user._id;

  try {
    const projects = await Project.find({ user: userId }).populate({
      path: "likes",
      select: "username avatar",
    });
    if (!projects.length) {
      return res.status(200).json({ message: "You have no projects yet." });
    }
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOneOfYourProjects = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  try {
    const project = await Project.findById({
      _id: projectId,
      user: userId,
    })
      .populate({
        path: "likes",
        select: "username avatar",
      })
      .populate({
        path: "comments", // Populate comments
        populate: {
          path: "user", // Populate user inside each comment
          select: "username avatar",
        },
        select: "content", // Select only the content of the comment
      });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you don't have permission to access it.",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOneProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId)
      .populate({
        path: "user",
        match: { isActive: true }, // Ensure the user is active
        select: "username avatar isActive",
      })
      .populate({
        path: "likes",
        select: "username avatar",
      })
      .populate({
        path: "comments", // Populate comments
        populate: {
          path: "user", // Populate user inside each comment
          select: "username avatar",
        },
        select: "content", // Select only the content of the comment
      });

    if (!project || !project.user) {
      return res
        .status(404)
        .json({ message: "Project was not found or user is inactive." });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProjects = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const projects = await Project.find()
      .populate({
        path: "user",
        match: { isActive: true }, // Only populate active users
        select: "username avatar isActive",
      })
      .populate({
        path: "likes",
        select: "username avatar",
      })
      .limit(limit * 1) // multiply by 1 to ensure 'limit' is a number
      .skip((page - 1) * limit);

    if (!projects.length) {
      return res
        .status(200)
        .json({ message: "There are no active projects here yet." });
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOneUsersProjects = async (req, res) => {
  const { userId } = req.params;
  try {
    const projects = await Project.find({ user: userId })
      .populate({
        path: "user",
        match: { isActive: true }, // Only populate active users
        select: "username avatar isActive",
      })
      .populate({
        path: "likes",
        select: "username avatar",
      });

    if (!projects.length) {
      return res
        .status(404)
        .json({ message: "There are no projects for this user." });
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTitleAndDescription = async (req, res) => {
  const { projectId } = req.params;
  const { description, title } = req.body;

  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      { description, title },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({ message: "Project successfully updated.", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMainImage = async (req, res) => {
  const { projectId } = req.params;
  const mainImage = req.file ? req.file.path : null;

  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      { mainImage },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res
      .status(200)
      .json({ message: "Main Image successfully updated.", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addImagesToGallery = async (req, res) => {
  const { projectId } = req.params;
  const images = req.files.images
    ? req.files.images.map((file) => file.path)
    : [];

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (images.length > 0) {
      project.images.push(...images);
    }

    await project.save();
    res.status(200).json({ message: "Images added successfully.", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeImagesFromGallery = async (req, res) => {
  const { projectId } = req.params;
  const { images } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (Array.isArray(images) && images.length > 0) {
      project.images = project.images.filter((img) => !images.includes(img));
    }

    await project.save();
    res.status(200).json({ message: "Images removed successfully.", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(400).json({ message: "Project not found." });
    }
    res.status(200).json({ message: "Project has been deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProject = async (req, res) => {
  console.log("In createProject function.");
  const { title, description } = req.body;
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
  if (!description) {
    emptyFields.push("description");
  }
  if (!mainImage) {
    emptyFields.push("mainImage");
  }
  if (images.length === 0) {
    emptyFields.push("images");
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill all fields", emptyFields });
  }

  try {
    const userId = req.user._id;
    const project = await Project.create({
      title,
      description,
      mainImage,
      images,
      user: userId,
    });
    console.log(
      "Project created successfully:",
      JSON.stringify(project, null, 2)
    ); // Log the created project properly
    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: error.message });
  }
};

const likeProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (userId.toString() === project.user.toString()) {
      return res
        .status(403)
        .json({ message: "You can´t like your own project." });
    }

    if (project.likes.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You have already liked this project." });
    }

    project.likes.push(userId);
    await project.save();

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: projectId } },
      { new: true }
    ).select("favorites");

    res.status(200).json({
      message: "Project liked successfully.",
      updatedFavorites: user.favorites, // Return the updated favorites array
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlikeProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!project.likes.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You have not liked this project yet." });
    }

    project.likes.pull(userId);
    await project.save();

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: projectId } },
      { new: true }
    ).select("favorites");

    res.status(200).json({
      message: "Project removed from likes successfully.",
      updatedFavorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getYourProjects,
  getOneOfYourProjects,
  getOneProject,
  getAllProjects,
  updateTitleAndDescription,
  updateMainImage,
  addImagesToGallery,
  removeImagesFromGallery,
  deleteProject,
  createProject,
  likeProject,
  unlikeProject,
  getOneUsersProjects,
};
