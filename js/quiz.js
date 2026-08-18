const API_URL = 'https://opentdb.com/api.php';
const HIGH_SCORE_KEY = 'quizHighScores';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default class Quiz {
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = numberOfQuestions;
    this.playerName = playerName;
    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.resultsSaved = false;
  }

  buildApiUrl() {
    const params = new URLSearchParams();
    params.set('amount', this.numberOfQuestions);

    if (this.category) {
      params.set('category', this.category);
    }

    if (this.difficulty) {
      params.set('difficulty', this.difficulty);
    }

    return `${API_URL}?${params.toString()}`;
  }

  async getQuestions() {
    const response = await fetch(this.buildApiUrl());

    if (!response.ok) {
      throw new Error(`The question service returned ${response.status}.`);
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('The question service returned invalid data.');
    }

    if (!data || typeof data.response_code !== 'number') {
      throw new Error('The question service returned an invalid response.');
    }

    if (data.response_code !== 0) {
      const messages = {
        1: 'There are not enough questions for these settings.',
        2: 'The selected quiz settings are invalid.',
        3: 'The quiz session could not be found.',
        4: 'The quiz session has no more questions.',
        5: 'The question service is busy. Please try again in a few seconds.'
      };

      throw new Error(messages[data.response_code] || 'The question service could not load questions.');
    }

    if (!Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('No questions were found for these settings.');
    }

    const hasValidShape = data.results.every(question => (
      question &&
      typeof question.category === 'string' &&
      typeof question.difficulty === 'string' &&
      typeof question.question === 'string' &&
      typeof question.correct_answer === 'string' &&
      Array.isArray(question.incorrect_answers) &&
      question.incorrect_answers.every(answer => typeof answer === 'string')
    ));

    if (!hasValidShape) {
      throw new Error('The question service returned incomplete question data.');
    }

    this.questions = data.results;
    this.currentQuestionIndex = 0;
    return this.questions;
  }

  incrementScore() {
    this.score += 1;
  }

  getCurrentQuestion() {
    if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.questions.length) {
      return null;
    }

    return this.questions[this.currentQuestionIndex];
  }

  nextQuestion() {
    this.currentQuestionIndex += 1;
    return !this.isComplete();
  }

  isComplete() {
    return this.currentQuestionIndex >= this.questions.length;
  }

  getTotalQuestions() {
    return this.questions.length || this.numberOfQuestions;
  }

  getScorePercentage() {
    const totalQuestions = this.getTotalQuestions();

    if (totalQuestions === 0) {
      return 0;
    }

    return Math.round((this.score / totalQuestions) * 100);
  }

  getHighScores() {
    try {
      const savedScores = localStorage.getItem(HIGH_SCORE_KEY);
      const scores = savedScores ? JSON.parse(savedScores) : [];
      return Array.isArray(scores) ? scores : [];
    } catch (error) {
      return [];
    }
  }

  isHighScore() {
    const scores = this.getHighScores();
    const percentage = this.getScorePercentage();

    if (scores.length < 10) {
      return true;
    }

    const sortedScores = scores
      .slice()
      .sort((first, second) => second.percentage - first.percentage);
    const lowestScore = sortedScores[sortedScores.length - 1];

    return lowestScore ? percentage > lowestScore.percentage : true;
  }

  saveHighScore() {
    const scores = this.getHighScores();
    const scoreRecord = {
      name: this.playerName,
      score: this.score,
      total: this.getTotalQuestions(),
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toISOString()
    };

    scores.push(scoreRecord);
    scores.sort((first, second) => {
      if (second.percentage !== first.percentage) {
        return second.percentage - first.percentage;
      }

      return second.score - first.score;
    });

    const topScores = scores.slice(0, 10);

    try {
      localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(topScores));
    } catch (error) {
      // A quiz should still finish if localStorage is unavailable.
    }
  }

  endQuiz() {
    const percentage = this.getScorePercentage();
    const isNewRecord = !this.resultsSaved && this.isHighScore();

    if (isNewRecord) {
      this.saveHighScore();
    }

    this.resultsSaved = true;

    const highScores = this.getHighScores();
    const leaderboardMarkup = highScores.length > 0
      ? highScores.map((record, index) => {
          const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
          return `
            <li class="leaderboard-item ${rankClass}">
              <span class="leaderboard-rank">#${index + 1}</span>
              <span class="leaderboard-name">${escapeHtml(record.name || 'Player')}</span>
              <span class="leaderboard-score">${Number(record.percentage) || 0}%</span>
            </li>
          `;
        }).join('')
      : '<li class="leaderboard-item"><span class="leaderboard-name">No scores yet</span></li>';

    return `
      <div class="game-card results-card">
        <div class="results-trophy"><i class="fa-solid fa-trophy"></i></div>
        <h2 class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.getTotalQuestions()}</p>
        <p class="results-percentage">${percentage}% Accuracy</p>
        ${isNewRecord ? `
          <div class="new-record-badge">
            <i class="fa-solid fa-star"></i> New High Score!
          </div>
        ` : ''}
        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>
          <ul class="leaderboard-list">
            ${leaderboardMarkup}
          </ul>
        </div>
        <div class="action-buttons">
          <button type="button" class="btn-restart">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }
}
