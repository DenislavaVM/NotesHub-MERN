const User = require("../models/user.model");
const logger = require("../logger");

exports.getUser = async (req, res, next) => {
  try {
    const user = req.user;
    const isUser = await User.findOne({ _id: user._id }).lean();

    if (!isUser) {
      return res.sendStatus(401);
    }

    return res.json({
      user: {
        firstName: isUser.firstName,
        lastName: isUser.lastName,
        email: isUser.email,
        _id: isUser._id,
        createdOn: isUser.createdOn,
      },
      message: "",
    });
  } catch (error) {
    logger.error(`Error retrieving user: ${error.message}`);
    next(error);
  }
};
