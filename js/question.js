const TIME_LIMIT = 15;
const WARNING_TIME = 5;
let audioContext = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function playTone(frequency, duration, type = 'sine') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startTime = audioContext.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.04, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  } catch (error) {
    // Sound is optional; answer handling must continue if audio is unavailable.
  }
}

function playCorrectSound() {
  playTone(720, 0.12);
  window.setTimeout(() => playTone(960, 0.14), 70);
}

function playIncorrectSound() {
  playTone(220, 0.2, 'sawtooth');
}

export default class Question {
  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;
    this.questionData = quiz.getCurrentQuestion();

    if (!this.questionData) {
      throw new Error('The current question is not available.');
    }

    this.index = quiz.currentQuestionIndex;
    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);
    this.difficulty = this.questionData.difficulty;
    this.wrongAnswers = this.questionData.incorrect_answers.map(answer => this.decodeHtml(answer));
    this.allAnswers = this.shuffleAnswers();
    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = TIME_LIMIT;
    this.keyboardHandler = null;
    this.transitionTimeout = null;
    this.animationTimeout = null;
    this.transitionStarted = false;
  }

  decodeHtml(html) {
    const documentParser = new DOMParser().parseFromString(html, 'text/html');
    return documentParser.documentElement.textContent || '';
  }

  shuffleAnswers() {
    const answers = [...this.wrongAnswers, this.correctAnswer];

    for (let index = answers.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [answers[index], answers[randomIndex]] = [answers[randomIndex], answers[index]];
    }

    return answers;
  }

  getProgress() {
    const totalQuestions = this.quiz.getTotalQuestions();

    if (totalQuestions === 0) {
      return 0;
    }

    return Math.round(((this.index + 1) / totalQuestions) * 100);
  }

  getDifficultyIcon() {
    const icons = {
      easy: 'fa-face-smile',
      medium: 'fa-face-meh',
      hard: 'fa-skull'
    };

    return icons[this.difficulty] || 'fa-gauge-high';
  }

  displayQuestion() {
    this.removeEventListeners();
    this.stopTimer();

    const totalQuestions = this.quiz.getTotalQuestions();
    const progress = this.getProgress();
    const answerHint = `Press 1-${this.allAnswers.length} to select`;
    const answersMarkup = this.allAnswers.map((answer, index) => `
      <button type="button" class="answer-btn" data-answer="${escapeHtml(answer)}" aria-label="Answer ${index + 1}: ${escapeHtml(answer)}. Press ${index + 1} to select.">
        <span class="answer-key">${index + 1}</span>
        <span class="answer-text">${escapeHtml(answer)}</span>
      </button>
    `).join('');

    this.container.innerHTML = `
      <div class="game-card question-card" role="region" aria-labelledby="questionText">
        <div class="xp-bar-container">
          <div class="xp-bar-header">
            <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
            <span class="xp-value">Question ${this.index + 1}/${totalQuestions}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-badge category">
            <i class="fa-solid fa-bookmark"></i>
            <span>${escapeHtml(this.category)}</span>
          </div>
          <div class="stat-badge difficulty ${escapeHtml(this.difficulty)}">
            <i class="fa-solid ${this.getDifficultyIcon()}"></i>
            <span>${escapeHtml(this.difficulty)}</span>
          </div>
          <div class="stat-badge timer" aria-live="polite">
            <i class="fa-solid fa-stopwatch"></i>
            <span class="timer-value">${this.timeRemaining}</span>s
          </div>
          <div class="stat-badge counter">
            <i class="fa-solid fa-gamepad"></i>
            <span>${this.index + 1}/${totalQuestions}</span>
          </div>
        </div>

        <h2 class="question-text" id="questionText">${escapeHtml(this.question)}</h2>

        <div class="answers-grid" role="listbox" aria-label="Answer options">
          ${answersMarkup}
        </div>

        <p class="keyboard-hint">
          <i class="fa-regular fa-keyboard"></i> ${answerHint}
        </p>

        <div class="score-panel">
          <div class="score-item">
            <div class="score-item-label">Score</div>
            <div class="score-item-value">${this.quiz.score}</div>
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
    this.startTimer();
  }

  addEventListeners() {
    const answerButtons = this.container.querySelectorAll('.answer-btn');

    answerButtons.forEach(button => {
      button.addEventListener('click', () => this.checkAnswer(button));
    });

    this.keyboardHandler = event => {
      if (this.answered) {
        return;
      }

      const answerNumber = Number(event.key);
      const isValidNumber = Number.isInteger(answerNumber)
        && answerNumber >= 1
        && answerNumber <= answerButtons.length;

      if (!isValidNumber) {
        return;
      }

      event.preventDefault();
      this.checkAnswer(answerButtons[answerNumber - 1]);
    };

    document.addEventListener('keydown', this.keyboardHandler);
  }

  removeEventListeners() {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  startTimer() {
    this.stopTimer();

    const timerElement = this.container.querySelector('.timer');
    const timerValue = this.container.querySelector('.timer-value');

    if (!timerElement || !timerValue) {
      return;
    }

    timerValue.textContent = this.timeRemaining;

    this.timerInterval = window.setInterval(() => {
      if (this.answered) {
        this.stopTimer();
        return;
      }

      this.timeRemaining -= 1;
      timerValue.textContent = this.timeRemaining;

      if (this.timeRemaining <= WARNING_TIME) {
        timerElement.classList.add('warning');
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleTimeUp() {
    if (this.answered) {
      return;
    }

    this.answered = true;
    this.stopTimer();
    this.removeEventListeners();
    this.highlightCorrectAnswer();

    const answerButtons = this.container.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
      if (!button.classList.contains('correct-reveal')) {
        button.classList.add('disabled');
      }
      button.setAttribute('aria-disabled', 'true');
    });

    const answersGrid = this.container.querySelector('.answers-grid');
    if (answersGrid) {
      answersGrid.insertAdjacentHTML('afterend', `
        <div class="time-up-message">
          <i class="fa-solid fa-clock"></i> TIME'S UP!
        </div>
      `);
    }

    playIncorrectSound();
    this.animateQuestion(1500);
  }

  checkAnswer(choiceElement) {
    if (this.answered || !choiceElement) {
      return;
    }

    this.answered = true;
    this.stopTimer();
    this.removeEventListeners();

    const selectedAnswer = choiceElement.dataset.answer || '';
    const isCorrect = selectedAnswer.trim().toLowerCase() === this.correctAnswer.trim().toLowerCase();
    const answerButtons = this.container.querySelectorAll('.answer-btn');

    if (isCorrect) {
      choiceElement.classList.add('correct');
      this.quiz.incrementScore();
      playCorrectSound();
    } else {
      choiceElement.classList.add('wrong');
      this.highlightCorrectAnswer();
      playIncorrectSound();
    }

    answerButtons.forEach(button => {
      const isCorrectButton = (button.dataset.answer || '').trim().toLowerCase() === this.correctAnswer.trim().toLowerCase();

      if (button !== choiceElement && !isCorrectButton) {
        button.classList.add('disabled');
      }

      button.setAttribute('aria-disabled', 'true');
    });

    const scoreValue = this.container.querySelector('.score-item-value');
    if (scoreValue) {
      scoreValue.textContent = this.quiz.score;
    }

    this.animateQuestion(1500);
  }

  highlightCorrectAnswer() {
    const answerButtons = this.container.querySelectorAll('.answer-btn');

    answerButtons.forEach(button => {
      const answer = (button.dataset.answer || '').trim().toLowerCase();
      if (answer === this.correctAnswer.trim().toLowerCase()) {
        button.classList.add('correct-reveal');
      }
    });
  }

  animateQuestion(duration = 1500) {
    if (this.transitionStarted) {
      return;
    }

    this.transitionStarted = true;
    this.removeEventListeners();
    this.stopTimer();

    const questionCard = this.container.querySelector('.question-card');
    const animationStart = Math.max(duration - 400, 0);

    this.animationTimeout = window.setTimeout(() => {
      this.animationTimeout = null;
      if (questionCard) {
        questionCard.classList.add('exit');
      }
    }, animationStart);

    this.transitionTimeout = window.setTimeout(() => {
      this.transitionTimeout = null;
      this.getNextQuestion();
    }, duration);
  }

  getNextQuestion() {
    const hasNextQuestion = this.quiz.nextQuestion();
    this.onQuizEnd(this.quiz, hasNextQuestion);
  }

  cleanup() {
    this.stopTimer();
    this.removeEventListeners();

    if (this.transitionTimeout !== null) {
      window.clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }

    if (this.animationTimeout !== null) {
      window.clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }

    this.transitionStarted = true;
  }
}
