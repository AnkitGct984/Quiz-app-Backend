const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../config/sendEmail');

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// @desc    Register new user - sends OTP to email
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - QuizMaker',
      text: `Hi ${user.name},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nQuizMaker Team`,
    });

    res.status(201).json({
      message: 'Account created! Please check your email for the verification code.',
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: 'Email verified successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'New Verification Code - QuizMaker',
      text: `Hi ${user.name},\n\nYour new verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nQuizMaker Team`,
    });

    res.json({ message: 'A new verification code has been sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in', email: user.email });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - QuizMaker',
      text: `Hi ${user.name},\n\nClick the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 30 minutes.\n\nQuizMaker Team`,
    });

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
};