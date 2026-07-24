const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{ type: Number }], // selected option index per question, in order
    score: { type: Number, required: true }, // number correct
    totalQuestions: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
