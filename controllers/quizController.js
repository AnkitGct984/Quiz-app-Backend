const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

// @desc    Create a new quiz
// @route   POST /api/quizzes
const createQuiz = async (req, res) => {
  try {
    const { title, description, category, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      questions,
      createdBy: req.user._id,
    });

    res.status(201).json(quiz);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes (list view - no correct answers exposed)
// @route   GET /api/quizzes
const getQuizzes = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const quizzes = await Quiz.find(query)
      .select('title description category attemptsCount createdBy createdAt questions')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add questionCount, don't send correct answers/options in list view
    const result = quizzes.map((q) => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      category: q.category,
      attemptsCount: q.attemptsCount,
      questionCount: q.questions.length,
      createdBy: q.createdBy,
      createdAt: q.createdAt,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single quiz to TAKE (correct answers hidden)
// @route   GET /api/quizzes/:id/take
const getQuizToTake = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const safeQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      createdBy: quiz.createdBy,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
      })),
    };

    res.json(safeQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single quiz for EDITING (creator only, includes correct answers)
// @route   GET /api/quizzes/:id
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this quiz data' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quizzes created by logged-in user
// @route   GET /api/quizzes/my-quizzes
const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a quiz (creator only)
// @route   DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }
    await quiz.deleteOne();
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit answers for a quiz, get score
// @route   POST /api/quizzes/:id/submit
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // array of selected option indexes, in question order
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Answers must match number of questions' });
    }

    let score = 0;
    const results = quiz.questions.map((q, idx) => {
      const isCorrect = answers[idx] === q.correctAnswerIndex;
      if (isCorrect) score++;
      return {
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        selectedAnswerIndex: answers[idx],
        isCorrect,
      };
    });

    await Attempt.create({
      quiz: quiz._id,
      user: req.user._id,
      answers,
      score,
      totalQuestions: quiz.questions.length,
    });

    quiz.attemptsCount += 1;
    await quiz.save();

    res.json({
      score,
      totalQuestions: quiz.questions.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's past attempts
// @route   GET /api/quizzes/my-attempts
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('quiz', 'title category')
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizToTake,
  getQuizById,
  getMyQuizzes,
  deleteQuiz,
  submitQuiz,
  getMyAttempts,
};
