const User = require("../models/User");
const { registerSchema, loginSchema } = require("./validation/authvalidation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const { name, email, password, role } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      role,
    });

    res.status(201).json({
      msg: "Done Create Account",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Please create an account" });

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword)
      return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).json({ msg: "Logout successful" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ msg: "All fields are required" });

    const user = await User.findById(req.user);

    if (!user) return res.status(404).json({ msg: "User not found" });

    const matchPassword = await bcrypt.compare(currentPassword, user.password);
    if (!matchPassword)
      return res.status(400).json({ msg: "Current password is incorrect" });

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();

    res.status(200).json({ msg: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

const updateProfileImage = async (req, res, next) => {
  try {
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ msg: "Profile image is required" });
    }

    if (!profileImage.startsWith("data:image/")) {
      return res.status(400).json({ msg: "Invalid image format" });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.profileImage = profileImage;
    await user.save();

    res.status(200).json({
      msg: "Profile image updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.status = user.status === "active" ? "suspended" : "active";
    await user.save();

    res.status(200).json({ msg: `User ${user.status}`, user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, changePassword, updateProfileImage, getAllUsers, toggleUserStatus, deleteUser }; 