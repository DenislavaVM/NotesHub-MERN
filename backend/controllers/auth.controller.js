const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../logger");

exports.createAccount = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.status(400).json({ error: true, message: errors.userExists });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    await user.save();

    const accessToken = jwt.sign({ user: { _id: user._id, firstName, lastName, email } }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    logger.info(`New user created: ${email}`);
    return res.json({ error: false, user, accessToken, message: success.registration });
  } catch (error) {
    logger.error(`Error during account creation: ${error.message}`);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userInfo = await User.findOne({ email });
    if (!userInfo) {
      return res.status(400).json({ error: true, message: errors.userNotFound });
    }

    const isPasswordValid = await bcrypt.compare(password, userInfo.password);
    if (isPasswordValid) {
      const user = { _id: userInfo._id, firstName: userInfo.firstName, lastName: userInfo.lastName, email: userInfo.email };
      const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

      logger.info(`User ${email} logged in successfully`);
      return res.json({ error: false, message: success.login, email, accessToken });
    } else {
      return res.status(400).json({ error: true, message: errors.invalidCredentials });
    }
  } catch (error) {
    logger.error(`Error during login: ${error.message}`);
    next(error);
  }
};