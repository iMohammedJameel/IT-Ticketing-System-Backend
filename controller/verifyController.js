const User = require("../models/User");
const bcrypt = require("bcrypt");

const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ msg: "Password is required" });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    res.status(200).json({ msg: "Password verified" });
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyPassword };
