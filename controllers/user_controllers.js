const User = require("../schemas/User");
const createToken = require("../services/tokenService");

const loginUser = async (req, res, next) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.login(identifier, password);
    const token = createToken(user._id, user.username);
    return res.status(200).json({ username: user.username, token });
  } catch (error) {
    next(error);
  }
};

const signUpUser = async (req, res, next) => {
  const { email, password, username } = req.body;
  try {
    const user = await User.signup(email, password, username);
    const token = createToken(user._id, user.username);
    return res.status(200).json({ username, token });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("favorites")
      .populate("savedBlogs")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }, "username avatar");
    if (!users.length) {
      return res.status(404).json({ message: "No users found." });
    }
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getOtherUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne(
      { _id: userId, isActive: true },
      "username avatar"
    )
      .lean()
      .populate("favorites")
      .populate("savedBlogs")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const editUserDetails = async (req, res) => {
  const { email, username, description, location, website } = req.body;

  try {
    if (email) {
      const existingUserByEmail = await User.findOne({ email });
      if (
        existingUserByEmail &&
        existingUserByEmail._id.toString() !== req.user._id.toString()
      ) {
        return res.status(400).json({ error: "Email is already in use" });
      }
    }

    if (username) {
      const existingUserByUsername = await User.findOne({ username });
      if (
        existingUserByUsername &&
        existingUserByUsername._id.toString() !== req.user._id.toString()
      ) {
        return res.status(400).json({ error: "Username is already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email, username, description, location, website },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const editAvatar = async (req, res) => {
  const avatar = req.file ? req.file.path : null;
  if (!avatar) {
    return res.status(400).json({ error: "No avatar file provided." });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "User profile picture updated", user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User account deactivated" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const followUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user._id;

  try {
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found." });
    }

    if (userToFollow.followers.includes(currentUser)) {
      return res
        .status(400)
        .json({ message: "You are already following this user." });
    }

    userToFollow.followers.push(currentUser);

    const currentUserRecord = await User.findById(currentUser);
    currentUserRecord.following.push(userId);
    await currentUserRecord.save();

    return res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user._id;
  try {
    const userToUnfollow = await User.findById(userId);
    userToUnfollow.followers.pull(currentUser);
    await userToUnfollow.save();

    const currentUserRecord = await User.findById(currentUser);
    currentUserRecord.following.pull(userId);
    await currentUserRecord.save();

    return res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  loginUser,
  signUpUser,
  getUser,
  getAllUsers,
  editAvatar,
  editUserDetails,
  getOtherUser,
  deleteUser,
  unfollowUser,
  followUser,
};
