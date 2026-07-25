const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

module.exports = router;