const express = require("express");
const upload = require("../services/upload");
const requireAuth = require("../middlewares/requireAuth");
const checkOwn = require("../middlewares/checkOwnership");
const {
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
} = require("../controllers/blog_controller");
const Blog = require("../schemas/Blog");

const app = express.Router();

app.use(requireAuth);

app.get("/all", getAllBlogs);
app.get("/your", getYourBlogs);
app.get("/:blogId", getOneBlog);
app.get("/your/:blogId", getOneOfYourBlogs);

app.post(
  "/create",
  (req, res, next) => {
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "imagesToAdd", maxCount: 10 },
    ])(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err); // Log the multer error
        return res.status(400).json({ error: "File upload failed." });
      }
      next();
    });
  },
  createBlog
);

app.put(
  "/:blogId/title-content",
  checkOwn(Blog, "blog"),
  updateTitleAndContent
);

app.put(
  "/:blogId/main-image",
  checkOwn(Blog, "blog"),
  upload.single("mainImage"),
  updateMainImage
);

app.put(
  "/:blogId/images/add",
  checkOwn(Blog, "blog"),
  upload.fields([{ name: "images", maxCount: 10 }]), // Field name must match
  addImagesToGallery
);

app.delete(
  "/:blogId/images/remove",
  checkOwn(Blog, "blog"),
  removeImagesFromGallery
);

app.delete("/:blogId", checkOwn(Blog, "blog"), deleteBlog);

app.post("/save/:blogId", saveBlog);
app.post("/unsave/:blogId", unsaveBlog);

module.exports = app;
