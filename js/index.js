import Quiz from './quiz.js';
import Question from './question.js';

const quizOptionsForm = document.getElementById('quizOptions');
const playerNameInput = document.getElementById('playerName');
const categoryInput = document.getElementById('categoryMenu');
const difficultyOptions = document.getElementById('difficultyOptions');
const questionsNumber = document.getElementById('questionsNumber');
const startQuizBtn = document.getElementById('startQuiz');
const questionsContainer = document.getElementById('questionsContainer');

let currentQuiz = null;
let currentQuestion = null;
let isStarting = false;
let formErrorTimeout = null;

function showLoading() {
  questionsContainer.innerHTML = `
    <div class="loading-overlay" role="status" aria-live="polite">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading Questions...</p>
    </div>
  `;
  startQuizBtn.disabled = true;
}

function hideLoading() {
  const loadingOverlay = questionsContainer.querySelector('.loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

function showError(message) {
  isStarting = false;
  startQuizBtn.disabled = false;
  questionsContainer.innerHTML = `
    <div class="game-card error-card" role="alert">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="error-title">Oops! Something went wrong</h3>
      <p class="error-message"></p>
      <button type="button" class="btn-play retry-btn">
        <i class="fa-solid fa-rotate-right"></i> Try Again
      </button>
    </div>
  `;

  const errorMessage = questionsContainer.querySelector('.error-message');
  const retryButton = questionsContainer.querySelector('.retry-btn');

  errorMessage.textContent = message;
  retryButton.addEventListener('click', resetToStart, { once: true });
}

function validateForm() {
  const numberOfQuestions = Number(questionsNumber.value.trim());

  if (!Number.isInteger(numberOfQuestions)) {
    return 'Please enter the number of questions.';
  }

  if (numberOfQuestions < 1) {
    return 'Please choose at least 1 question.';
  }

  if (numberOfQuestions > 50) {
    return 'You can choose a maximum of 50 questions.';
  }

  return '';
}

function showFormError(message) {
  const existingError = quizOptionsForm.querySelector('.form-error');
  if (existingError) {
    existingError.remove();
  }

  if (formErrorTimeout) {
    window.clearTimeout(formErrorTimeout);
  }

  const formError = document.createElement('div');
  formError.className = 'form-error';
  formError.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';

  const errorText = document.createElement('span');
  errorText.textContent = message;
  formError.append(errorText);
  startQuizBtn.before(formError);

  formErrorTimeout = window.setTimeout(() => {
    formError.style.opacity = '0';
    formError.style.transition = 'opacity 0.3s ease';

    window.setTimeout(() => {
      formError.remove();
    }, 300);
  }, 2700);
}

function resetCustomSelect(selectId, hiddenInputId, value) {
  const select = document.getElementById(selectId);
  const hiddenInput = document.getElementById(hiddenInputId);

  if (!select || !hiddenInput) {
    return;
  }

  const option = [...select.querySelectorAll('.custom-select-option')]
    .find(item => item.dataset.value === value);
  const textSpan = select.querySelector('.custom-select-text');
  const iconSpan = select.querySelector('.custom-select-icon');

  select.dataset.value = value;
  hiddenInput.value = value;

  if (option && textSpan && iconSpan) {
    textSpan.textContent = option.textContent.trim();
    const optionIcon = option.querySelector('i');
    iconSpan.innerHTML = optionIcon ? optionIcon.outerHTML : '';
  }

  select.querySelectorAll('.custom-select-option').forEach(item => {
    item.classList.toggle('selected', item === option);
  });
}

function resetToStart() {
  if (currentQuestion) {
    currentQuestion.cleanup();
  }

  currentQuestion = null;
  currentQuiz = null;
  isStarting = false;

  if (formErrorTimeout) {
    window.clearTimeout(formErrorTimeout);
    formErrorTimeout = null;
  }

  questionsContainer.innerHTML = '';
  quizOptionsForm.reset();
  quizOptionsForm.classList.remove('hidden');
  startQuizBtn.disabled = false;

  resetCustomSelect('categorySelect', 'categoryMenu', '');
  resetCustomSelect('difficultySelect', 'difficultyOptions', 'easy');
}

function showResults(quiz) {
  if (quiz !== currentQuiz) {
    return;
  }

  currentQuestion = null;
  isStarting = false;
  questionsContainer.innerHTML = quiz.endQuiz();

  const restartButton = questionsContainer.querySelector('.btn-restart');
  if (restartButton) {
    restartButton.addEventListener('click', resetToStart, { once: true });
  }
}

function handleQuestionComplete(quiz, hasNextQuestion) {
  if (quiz !== currentQuiz) {
    return;
  }

  if (hasNextQuestion) {
    currentQuestion = new Question(quiz, questionsContainer, handleQuestionComplete);
    currentQuestion.displayQuestion();
    return;
  }

  showResults(quiz);
}

async function startQuiz() {
  if (isStarting) {
    return;
  }

  const validationError = validateForm();
  if (validationError) {
    showFormError(validationError);
    return;
  }

  const playerName = playerNameInput.value.trim() || 'Player';
  const category = categoryInput.value;
  const difficulty = difficultyOptions.value;
  const numberOfQuestions = Number(questionsNumber.value);

  isStarting = true;
  currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName);
  currentQuestion = null;
  quizOptionsForm.classList.add('hidden');
  showLoading();

  try {
    const questions = await currentQuiz.getQuestions();

    if (!questions.length) {
      throw new Error('No questions were found for these settings.');
    }

    hideLoading();
    currentQuestion = new Question(currentQuiz, questionsContainer, handleQuestionComplete);
    currentQuestion.displayQuestion();
  } catch (error) {
    hideLoading();
    showError(error.message || 'Failed to load questions. Please try again.');
  }
}

if (
  quizOptionsForm &&
  playerNameInput &&
  categoryInput &&
  difficultyOptions &&
  questionsNumber &&
  startQuizBtn &&
  questionsContainer
) {
  startQuizBtn.addEventListener('click', startQuiz);

  questionsNumber.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      startQuiz();
    }
  });

  quizOptionsForm.addEventListener('submit', event => {
    event.preventDefault();
    startQuiz();
  });
}
