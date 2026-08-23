# QuizMaster

QuizMaster is a neon arcade-style trivia game built as a lightweight browser application. Players can enter a name, choose a category and difficulty, set the number of questions, and play through a timed quiz powered by the Open Trivia Database. Results are scored immediately and saved locally to a top-ten leaderboard.

## Screenshots

The screenshots below were captured from the running application rather than recreated mockups.

### Desktop — Setup Screen

![QuizMaster setup screen on desktop](https://private-us-east-1.manuscdn.com/sessionFile/Anc7QtENjLQHzGPBn5ONwi/sandbox/H3KY3p8xZ9wHiuGF1MVEOw-images_1787499892915_na1fn_L2hvbWUvdWJ1bnR1L3dvcmtzcGFjZS9xdWl6LWFwcC9RdWl6LUFwcC1Qcm9qZWN0LW1haW4vc2NyZWVuc2hvdHMvaG9tZS1kZXNrdG9w.png?Expires=1787672935&Signature=MEUCIQCpPA-wjoG3kZeMyGnExTLV6i3SlH1povrsKb1rb9sI4wIgfomQCtSJWpzHnTL1aL7YvZXMP57sz6zV3Xsi7VM09i8_&Key-Pair-Id=K1K5N5YNBUUMMN)

### Mobile — Responsive Setup Screen

![QuizMaster setup screen on mobile](https://private-us-east-1.manuscdn.com/sessionFile/Anc7QtENjLQHzGPBn5ONwi/sandbox/H3KY3p8xZ9wHiuGF1MVEOw-images_1787499892915_na1fn_L2hvbWUvdWJ1bnR1L3dvcmtzcGFjZS9xdWl6LWFwcC9RdWl6LUFwcC1Qcm9qZWN0LW1haW4vc2NyZWVuc2hvdHMvaG9tZS1tb2JpbGU.png?Expires=1787672935&Signature=MEUCIQDvQcr-UEVOzXA0tzw-RDRX-T8zKs94eo7t2N4B4yIB1wIgCCMMqP-7Tytg~hc~IP1Qm-h7zXpMez0gqMSgvlAaq68_&Key-Pair-Id=K1K5N5YNBUUMMN)

### Desktop — Gameplay

![QuizMaster gameplay screen](https://private-us-east-1.manuscdn.com/sessionFile/Anc7QtENjLQHzGPBn5ONwi/sandbox/H3KY3p8xZ9wHiuGF1MVEOw-images_1787499892915_na1fn_L2hvbWUvdWJ1bnR1L3dvcmtzcGFjZS9xdWl6LWFwcC9RdWl6LUFwcC1Qcm9qZWN0LW1haW4vc2NyZWVuc2hvdHMvcXVpei1kZXNrdG9w.png?Expires=1787672935&Signature=MEUCIFPK9eVAGrk3ztQnpWCtZbjQaeZ3jH6KvW9h8jydH72UAiEAgYrHhzTmurEdRDRFKzs7uchSXh30pw5-TegjsbyQ9y4_&Key-Pair-Id=K1K5N5YNBUUMMN)

### Desktop — Results and Leaderboard

![QuizMaster results screen](https://private-us-east-1.manuscdn.com/sessionFile/Anc7QtENjLQHzGPBn5ONwi/sandbox/H3KY3p8xZ9wHiuGF1MVEOw-images_1787499892915_na1fn_L2hvbWUvdWJ1bnR1L3dvcmtzcGFjZS9xdWl6LWFwcC9RdWl6LUFwcC1Qcm9qZWN0LW1haW4vc2NyZWVuc2hvdHMvcmVzdWx0cy1kZXNrdG9w.png?Expires=1787672935&Signature=MEUCIAkuAW7xPV8kbF03oxJMeK3Ip-3-cLOpvQlR69tgYoToAiEA~2tc3-NWht0U6eGuIfsk3gWuyE-B1YRmR2gryfviSKY_&Key-Pair-Id=K1K5N5YNBUUMMN)

## LinkedIn Showcase Video

A 45-second portfolio video presents the real setup flow, responsive mobile layout, gameplay timer, answer interface, and results leaderboard.

[Watch or download the LinkedIn showcase video](./media/linkedin-showcase.mp4)

## Features

QuizMaster provides a complete start-to-finish quiz flow. Players can enter a display name, select Random Category or one of the available trivia categories, choose Easy, Medium, or Hard mode, and configure between 1 and 50 questions with the custom number stepper.

During gameplay, each question is rendered with a progress bar, category and difficulty badges, a 15-second countdown timer, shuffled answer options, a live score, and a keyboard hint. Players can answer with the mouse or press the corresponding number key. Correct and incorrect choices receive distinct visual and audio feedback, while unanswered questions reveal the correct option when the timer reaches zero.

After the final question, the results view shows the score, accuracy percentage, high-score notification when applicable, and a top-ten leaderboard. Scores are retained in the browser through local storage, and the Play Again action returns the interface to the setup screen.

## Technologies

| Technology | Use in this project |
| --- | --- |
| HTML5 | Semantic page structure, form controls, and accessible quiz markup |
| CSS3 | Responsive layout, custom controls, gradients, animations, focus states, and reduced-motion support |
| JavaScript ES modules | Quiz state, DOM rendering, validation, event handling, timers, scoring, and local persistence |
| Open Trivia Database API | Remote question data source |
| Font Awesome 6.5.1 | Interface icons |
| Google Fonts — Orbitron and Rajdhani | Display and interface typography |
| Web Audio API | Optional correct and incorrect answer tones |
| Browser localStorage | Top-ten high-score persistence |

## Key Technical Highlights

The application separates quiz state from question presentation. `Quiz` manages API requests, question progress, scoring, percentage calculations, and leaderboard persistence, while `Question` owns the current question's rendering, shuffled answers, keyboard and click handlers, timer lifecycle, feedback states, and transition timing.

The implementation also demonstrates defensive client-side handling. API responses are checked for HTTP failures, invalid JSON, unexpected response codes, empty result sets, and incomplete question shapes. API-provided HTML entities are decoded before display, while rendered text is escaped when interpolated into markup. The form validates the question count before starting a game, and the UI can recover from a failed request through its retry path.

Interactive details include custom category and difficulty selectors, a bounded increment/decrement question control, keyboard answer shortcuts, `aria-live` timer updates, focus-visible answer styles, optional sound feedback, and a `prefers-reduced-motion` media query for users who request less animation.

## Responsive Design

The desktop layout presents the setup and quiz cards in a centered arcade-style composition with two-column answer buttons. At viewport widths below 768px, the answer grid becomes a single column, question and result typography scales down, the statistics row wraps and centers, and the keyboard hint is hidden to keep the mobile layout focused. The header tagline is also hidden on narrow screens while the QuizMaster branding remains visible.

## Project Structure

```
Quiz-App-Project-main/
├── CSS/
│   └── style.css
├── images/
│   └── favicon.png
├── js/
│   ├── index.js
│   ├── question.js
│   ├── quiz.js
│   └── ui-controls.js
├── screenshots/
│   ├── home-desktop.png
│   ├── home-mobile.png
│   ├── quiz-desktop.png
│   └── results-desktop.png
├── media/
│   └── linkedin-showcase.mp4
├── index.html
└── README.md
```

## Getting Started

QuizMaster is a static frontend project and does not require a build step or package installation. Because the browser loads JavaScript modules, run it through a local HTTP server rather than opening `index.html` directly.

```bash
git clone <your-repository-url>
cd Quiz-App-Project-main
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173) in a browser. The app needs an internet connection when a quiz starts so it can request questions from the Open Trivia Database and load the external icon and font assets.

If you prefer, the folder can also be opened with a local development server such as VS Code Live Server.

## What I Learned

This project provided practical experience designing a complete browser flow without a framework: collecting setup values, validating input, requesting and shaping remote data, rendering state-driven interfaces, coordinating timers with user input, and cleaning up listeners between questions. It also reinforced the importance of responsive behavior, accessible feedback, defensive API handling, and keeping gameplay usable even when optional audio or local storage is unavailable.

## Future Improvements

A future iteration could add a question-history review to the results screen, more granular category coverage from the Open Trivia Database, a user-selectable timer length, and a dedicated settings panel for sound and reduced-motion preferences. Automated browser tests would also make the API error, timeout, keyboard-answer, and leaderboard flows easier to regression-test.

## Author

Author information was not included in the supplied project files.

- **GitHub Repository:** [Quiz-App-Project](https://github.com/ZeyadHany268/Quiz-App-Project)

- **Live Demo:** [QuizMaster](https://zeyadhany268.github.io/Quiz-App-Project/)

## References

[1]: https://opentdb.com/api_config.php "Open Trivia Database API configuration"

[2]: https://fontawesome.com/ "Font Awesome"

[3]: https://fonts.google.com/ "Google Fonts"
