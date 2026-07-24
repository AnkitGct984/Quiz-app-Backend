const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getQuizToTake,
  getQuizById,
  getMyQuizzes,
  deleteQuiz,
  submitQuiz,
  getMyAttempts,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getQuizzes);
router.get('/my-quizzes', protect, getMyQuizzes);
router.get('/my-attempts', protect, getMyAttempts);
router.get('/:id/take', getQuizToTake);
router.get('/:id', protect, getQuizById);

router.post('/', protect, createQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;
