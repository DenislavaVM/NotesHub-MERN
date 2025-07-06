const User = require("../models/user.model");
const logger = require("../logger");
const { AuthenticationError, DatabaseError } = require("../errors");

exports.getUser = async (req, res, next) => {
  try {
    const user = req.user;
    const userData = await User.findOne({ _id: user._id })
      .select("-password -__v");

    if (!userData) {
      throw new AuthenticationError("User not found");
    };

    res.json({
      success: true,
      data: {
        user: userData,
        message: "User retrieved successfully"
      }
    });
  } catch (error) {
    logger.error(`Error retrieving user: ${error.message}`);
    next(error);
  }
};