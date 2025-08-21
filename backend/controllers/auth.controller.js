const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ValidationError, AuthenticationError, AuthorizationError } = require("../errors");
const User = require("../models/user.model");
const Note = require("../models/note.model");
const logger = require("../logger");
const { ACCESS_TOKEN_SECRET, TOKEN_EXPIRATION, JWT_REFRESH_SECRET, REFRESH_TOKEN_EXPIRATION } = require("../config/jwtConfig");
const { isProduction, BCRYPT_SALT_ROUNDS } = require("../config/env");

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

const generateAndSetTokens = async (res, user, session) => {
  const accessToken = jwt.sign(
    { user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } },
    ACCESS_TOKEN_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRATION }
  );

  user.refreshToken = refreshToken;
  await user.save({ session });
  res.cookie("jwt", refreshToken, cookieOptions);
  return accessToken;
};

exports.createAccount = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!firstName || !lastName || !email || !password) {
      throw new ValidationError("All fields are required");
    }

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw new ValidationError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    const accessToken = await generateAndSetTokens(res, user, session);

    const welcomeNoteContent =
      `This is your first note. Here are a few tips to get you started:
- Click the big '+' button to create a new note.
- Click on any note to edit its content and title.
- Use the share button on a note to collaborate with friends in real-time!
- Organize your thoughts by creating and assigning labels.

Feel free to edit or delete this note. Happy note-taking!`;

    const welcomeNote = new Note({
      title: "Welcome to NotesHub! 🎉",
      content: welcomeNoteContent,
      userId: user._id,
      isPinned: true,
    });
    await welcomeNote.save({ session });
    await session.commitTransaction();
    logger.info(`New user created: ${email}`);
    res.status(201).json({
      success: true,
      user: { _id: user._id, firstName, lastName, email },
      accessToken,
    });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await User.findOne({ email }).session(session);
    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    const accessToken = await generateAndSetTokens(res, user, session);
    await session.commitTransaction();
    logger.info(`User ${email} logged in successfully`);
    res.json({
      success: true,
      accessToken,
      user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
    });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.handleRefreshToken = async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return next(new AuthenticationError("No refresh token provided"));
  }

  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      res.clearCookie("jwt", cookieOptions);
      return next(new AuthorizationError("Invalid refresh token"));
    }

    const accessToken = jwt.sign(
      { user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } },
      ACCESS_TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("jwt", newRefreshToken, cookieOptions);
    res.json({ success: true, accessToken });

  } catch (error) {
    res.clearCookie("jwt", cookieOptions);
    return next(new AuthorizationError("Invalid or expired refresh token"));
  }
};


exports.logout = async (req, res, next) => {
  const { jwt: refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.sendStatus(204);
  }

  try {
    await User.updateOne({ refreshToken }, { $unset: { refreshToken: "" } });

    res.clearCookie("jwt", cookieOptions);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};