const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [(arr) => arr.length >= 2, 'At least 2 options are required'],
  },
  correctAnswerIndex: { type: Number, required: true }, // index into options array
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    questions: {
      type: [questionSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'At least 1 question is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attemptsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
