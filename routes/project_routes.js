const express = require("express");
const upload = require("../services/upload");
const requireAuth = require("../middlewares/requireAuth");
const checkOwn = require("../middlewares/checkOwnership");
const {
  getYourProjects,
  getOneOfYourProjects,
  getOneProject,
  getAllProjects,
  updateTitleAndDescription,
  updateMainImage,
  deleteProject,
  createProject,
  likeProject,
  unlikeProject,
  addImagesToGallery,
  removeImagesFromGallery,
} = require("../controllers/project_controller");
const Project = require("../schemas/Project");

const app = express.Router();

// Public routes
app.get("/all-projects", getAllProjects);
app.get("/all-projects/:projectId", getOneProject);

app.use(requireAuth);

// Authenticated user-specific routes
app.get("/your-projects", getYourProjects);
app.get("/your-projects/:projectId", getOneOfYourProjects);

app.post(
  "/create",
  (req, res, next) => {
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "images", maxCount: 10 },
    ])(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err); // Log the multer error
        return res.status(400).json({ error: "File upload failed." });
      }
      next();
    });
  },
  createProject
);

app.post("/like/:projectId", likeProject);
app.post("/unlike/:projectId", unlikeProject);
// Routes for modifying the user's own projects (use checkOwn middleware)
app.put(
  "/:projectId/title-description",
  checkOwn(Project, "project"),
  updateTitleAndDescription
);

app.put(
  "/:projectId/main-image",
  checkOwn(Project, "project"),
  upload.single("mainImage"),
  updateMainImage
);

app.put(
  "/:projectId/images/add",
  checkOwn(Project, "project"),
  upload.fields([{ name: "images", maxCount: 10 }]),
  addImagesToGallery
);

app.delete(
  "/:projectId/images/remove",
  checkOwn(Project, "project"),
  removeImagesFromGallery
);

app.delete("/:projectId", checkOwn(Project, "project"), deleteProject);

module.exports = app;
