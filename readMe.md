# My Art Gallery

My Art Gallery is a project where users can create galleries, upload projects, showcase progress pictures, comment on projects, and favorite them. They are also able to create their own blog posts and share their knowledge with others. This is a full-stack web app using Node.js (for the backend), React.js (for the frontend), MongoDB (as a database), and JWT authentication.

### File Structure

```
my_art_gallery_backend/
|- config/
|   └─ dbinit.js
|- controllers/
|   └─ user_controller.js
|   └─ comment_controller.js
|   └─ project_controller.js
|   └─ blog_controller.js
|- middlewares/
|   └─ requireAuth.js
|   └─ checkOwnership.js
|- schemas/
|   └─ User.js
|   └─ Project.js
|   └─ Comment.js
|   └─ Blog.js
|- routers/
|   └─ user_routes.js
|   └─ comment.js
|   └─ project_routes.js
|   └─ blog_routes.js
|- services/
|   └─ tokenService.js
|   └─ upload.js
└─ server.js

```

### Core Entities:

- **User**: Users can have profiles, upload projects, like/favorite other projects, and leave comments.
- **Project**: Each project can contain multiple images (for progress), text, or other media, and can be favorized or commented on. Users can favorite a project, which will be stored in their profile.
- **Comment**: Users can comment on projects.
- **Blogs**: Each user can also write blog posts and offer advice on their techniques. Blogs can be saved by other users, so they can easily find them again.

### Overview

This project is built using **Node.js**, **Express**, **MongoDB** (with **Mongoose**), and includes authentication with **JWT** (JSON Web Token). The **Validator** package is used to validate data.

#### Technologies Used

- [Validator](https://www.npmjs.com/package/validator): A library for string validation and sanitization.
- [JWT (jsonwebtoken)](https://www.npmjs.com/package/jsonwebtoken): A package to handle authentication through JSON Web Tokens.
- [Express](https://www.npmjs.com/package/express): A web framework for Node.js.
- [MongoDB](https://www.mongodb.com/): A NoSQL database for storing data.
- [Mongoose](https://www.npmjs.com/package/mongoose): An object data modeling (ODM) library for MongoDB and Node.js.

### Installation

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
npm install
```
