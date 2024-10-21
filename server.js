const express = require("express");
const app = express();
require("dotenv").config();
require("colors");
const port = process.env.PORT || 8080;
const connectDB = require("./config/dbinit");
connectDB();
const cors = require("cors");
const user = require("./routes/user_routes");
const project = require("./routes/project_routes");
const comment = require("./routes/comment_routes");
const blog = require("./routes/blog_routes");

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Login Tester!");
});

app.use("/user", user);
app.use("/project", project);
app.use("/comment", comment);
app.use("/blog", blog);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`.bgGreen.black);
});
