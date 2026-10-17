
const voltage = document.getElementById("voltage");
const resistance = document.getElementById("resistance");

const voltageValue = document.getElementById("voltageValue");
const resistanceValue = document.getElementById("resistanceValue");
const currentValue = document.getElementById("currentValue");
const bulb = document.getElementById("bulb");
const circuitStatus = document.getElementById("circuitStatus");

// Interactive Ohm's Law simulation
function updateSimulation() {
  const v = Number(voltage.value);
  const r = Number(resistance.value);
  const current = v / r;

  voltageValue.textContent = v;
  resistanceValue.textContent = r;
  currentValue.textContent = current.toFixed(2) + " A";

  bulb.classList.toggle("lit", v > 0);
  circuitStatus.textContent =
    v > 0 ? "Current is flowing!" : "No voltage: no current.";
}

voltage.addEventListener("input", updateSimulation);
resistance.addEventListener("input", updateSimulation);

updateSimulation();

// Practice problem
const practiceForm = document.getElementById("practiceForm");
const practiceAnswer = document.getElementById("practiceAnswer");
const practiceFeedback = document.getElementById("practiceFeedback");

practiceForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const answer = Number(practiceAnswer.value);

  if (Math.abs(answer - 3) < 0.001) {
    practiceFeedback.textContent = "Correct! I = V / R = 9 / 3 = 3 A.";
    practiceFeedback.style.color = "#137653";
  } else {
    practiceFeedback.textContent =
      "Not quite. Use I = V / R. Try again!";
    practiceFeedback.style.color = "#c04747";
  }
});

// Quiz questions
const questions = [
  {
    question: "Which formula represents Ohm's Law?",
    options: ["V = I × R", "V = I / R", "V = R / I", "I = V + R"],
    answer: 0
  },
  {
    question: "What is the SI unit of electric current?",
    options: ["Volt", "Ohm", "Ampere", "Watt"],
    answer: 2
  },
  {
    question: "If V = 12 V and R = 4 Ω, what is the current?",
    options: ["2 A", "3 A", "4 A", "48 A"],
    answer: 1
  },
  {
    question: "What happens to current if voltage increases while resistance stays constant?",
    options: [
      "Current decreases",
      "Current stays the same",
      "Current increases",
      "Resistance becomes zero"
    ],
    answer: 2
  },
  {
    question: "What is the SI unit of resistance?",
    options: ["Ampere", "Volt", "Joule", "Ohm"],
    answer: 3
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("options");
const quizFeedback = document.getElementById("quizFeedback");
const scoreDisplay = document.getElementById("score");
const nextButton = document.getElementById("nextButton");

function showQuestion() {
  answered = false;

  const q = questions[currentQuestion];

  questionNumber.textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  questionText.textContent = q.question;
  quizFeedback.textContent = "";
  scoreDisplay.textContent = `Score: ${score}`;

  optionsContainer.innerHTML = "";

  q.options.forEach(function (option, index) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "option";
    button.textContent =
      `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", function () {
      checkAnswer(index);
    });

    optionsContainer.appendChild(button);
  });

  nextButton.disabled = true;
  nextButton.textContent =
    currentQuestion === questions.length - 1
      ? "See Results"
      : "Next Question →";
}

function checkAnswer(selectedIndex) {
  if (answered) return;

  answered = true;

  const correctIndex = questions[currentQuestion].answer;
  const buttons = optionsContainer.querySelectorAll(".option");

  buttons.forEach(function (button, index) {
    button.disabled = true;

    if (index === correctIndex) {
      button.classList.add("correct");
    }

    if (index === selectedIndex && index !== correctIndex) {
      button.classList.add("incorrect");
    }
  });

  if (selectedIndex === correctIndex) {
    score++;
    quizFeedback.textContent = "Correct! Well done.";
    quizFeedback.style.color = "#137653";
  } else {
    quizFeedback.textContent =
      `Incorrect. The correct answer is ${questions[currentQuestion].options[correctIndex]}.`;
    quizFeedback.style.color = "#c04747";
  }

  scoreDisplay.textContent = `Score: ${score}`;
  nextButton.disabled = false;
}

nextButton.addEventListener("click", function () {
  if (!answered) return;

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showResults();
  }
});

function showResults() {
  questionNumber.textContent = "Quiz completed!";
  questionText.textContent = `You scored ${score} out of ${questions.length}.`;

  optionsContainer.innerHTML = "";

  quizFeedback.textContent =
    score === questions.length
      ? "Excellent! You mastered this quiz."
      : "Good effort! Review the lesson and try again.";

  quizFeedback.style.color = "#3158bc";

  nextButton.disabled = false;
  nextButton.textContent = "Try Again";
  nextButton.onclick = restartQuiz;
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  nextButton.onclick = null;
  showQuestion();
}

showQuestion();
