/*
  Project: Dynamic Quiz App
  Author: Anubhav Maandey
  College: Ajay Kumar Garg Engineering College
  Roll No: 2200270120028
  Features: Category/Difficulty filter, 30s timer per question, result analytics + charts
*/
const QUIZ_LIMIT = 24;
const QUESTION_TIME = 30; // seconds

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function byId(id) {
  return document.getElementById(id);
}

function loadQuizState() {
  const raw = localStorage.getItem("quizState");
  return raw ? JSON.parse(raw) : null;
}

function saveQuizState(state) {
  localStorage.setItem("quizState", JSON.stringify(state));
}

function initQuizState() {
  const selectedCategory = localStorage.getItem("selectedCategory") || "Java";
  const selectedDifficulty = localStorage.getItem("selectedDifficulty") || "Easy";

  const filtered = QUESTIONS.filter(q =>
    q.category === selectedCategory && q.difficulty === selectedDifficulty
  );

  // If less than 10 available, we just take as many as possible
  const picked = shuffle(filtered).slice(0, QUIZ_LIMIT);

  const state = {
    meta: {
      category: selectedCategory,
      difficulty: selectedDifficulty,
      timePerQuestion: QUESTION_TIME,
      totalQuestions: picked.length
    },
    questions: picked,
    currentIndex: 0,
    selectedAnswers: Array(picked.length).fill(null), // 0..3 or null
    timeSpent: Array(picked.length).fill(0),          // seconds
    // used for timing calculations
    questionStartTs: Date.now()
  };

  saveQuizState(state);
  return state;
}

/* ---------------------- QUIZ PAGE LOGIC ---------------------- */
function isQuizPage() {
  return window.location.pathname.endsWith("quiz.html");
}

function isResultPage() {
  return window.location.pathname.endsWith("result.html");
}

let timerInterval = null;
let timeLeft = QUESTION_TIME;

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer(onTimeUp) {
  stopTimer();
  timeLeft = QUESTION_TIME;

  const timerEl = byId("timer");
  if (timerEl) {
    timerEl.textContent = String(timeLeft);
    timerEl.style.opacity = "1";
  }

  timerInterval = setInterval(() => {
    // 1) decrease time
    timeLeft -= 1;

    // 2) update timer text
    if (timerEl) {
      timerEl.textContent = String(timeLeft);
      timerEl.style.opacity = (timeLeft <= 5) ? "0.9" : "1";
    }

    // 3) show Hurry up only if user hasn't selected an option
    if (timeLeft <= 5) {
      const statusEl = byId("status");
      if (statusEl && !statusEl.textContent.startsWith("Selected option")) {
        statusEl.textContent = "Hurry up! ⏳";
      }
    }

    // 4) when time becomes 0, stop and move forward
    if (timeLeft <= 0) {
      stopTimer();
      onTimeUp();
    }
  }, 1000);
}

function recordTimeSpent(state) {
  const now = Date.now();
  const idx = state.currentIndex;
  const deltaSec = Math.max(0, Math.round((now - state.questionStartTs) / 1000));
  // Cap to QUESTION_TIME (so it doesn’t exceed)
  state.timeSpent[idx] = Math.min(QUESTION_TIME, state.timeSpent[idx] + deltaSec);
  state.questionStartTs = now;
}

function renderQuestion(state) {
  const q = state.questions[state.currentIndex];
  if (!q) return;

  byId("quizTitle").textContent = "Quiz";
  byId("quizMeta").textContent = `Category: ${state.meta.category} • Difficulty: ${state.meta.difficulty}`;
  byId("progress").textContent = `${state.currentIndex + 1} / ${state.meta.totalQuestions}`;

  const statusEl = byId("status");
  const sel = state.selectedAnswers[state.currentIndex];
  statusEl.textContent = sel === null ? "Not answered yet" : `Selected option: ${sel + 1}`;

  byId("questionText").textContent = q.question;

  const optionsWrap = byId("options");
  optionsWrap.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "optionBtn";
    btn.id = `option-${i}`;
    btn.setAttribute("data-testid", `option-${i}`);
    btn.textContent = `${i + 1}. ${opt}`;

    if (state.selectedAnswers[state.currentIndex] === i) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", () => {
  // Save selected answer
  state.selectedAnswers[state.currentIndex] = i;
  saveQuizState(state);

  // Update UI selection WITHOUT re-rendering (so timer won't reset)
  const allButtons = optionsWrap.querySelectorAll("button.optionBtn");
  allButtons.forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");

  // Update status text
  const statusEl = byId("status");
  if (statusEl) statusEl.textContent = `Selected option: ${i + 1}`;
    });

    optionsWrap.appendChild(btn);
  });

  // Buttons enable/disable
  byId("prevBtn").disabled = state.currentIndex === 0;
  byId("nextBtn").disabled = state.currentIndex === state.meta.totalQuestions - 1;
  byId("submitBtn").disabled = state.meta.totalQuestions === 0;

  // Timer (reset for each question)
  state.questionStartTs = Date.now();
  saveQuizState(state);

  startTimer(() => {
    // time up => treat as skipped if not answered, auto next/submit
    if (state.selectedAnswers[state.currentIndex] === null) {
      // remains null = skipped
    }
    // record full time for this question (or near full)
    state.timeSpent[state.currentIndex] = QUESTION_TIME;
    saveQuizState(state);

    if (state.currentIndex < state.meta.totalQuestions - 1) {
      state.currentIndex += 1;
      state.questionStartTs = Date.now();
      saveQuizState(state);
      renderQuestion(state);
    } else {
      finalizeAndGoToResult(state);
    }
  });
}

function finalizeAndGoToResult(state) {
  stopTimer();
  // record time for current question if leaving early
  recordTimeSpent(state);

  const details = state.questions.map((q, i) => {
    const chosen = state.selectedAnswers[i];
    const correct = q.answerIndex;
    const isCorrect = chosen !== null && chosen === correct;
    return {
      id: q.id,
      question: q.question,
      options: q.options,
      chosenIndex: chosen,
      correctIndex: correct,
      isCorrect,
      timeSpent: state.timeSpent[i]
    };
  });

  const correctCount = details.filter(d => d.isCorrect).length;
  const wrongCount = details.filter(d => d.chosenIndex !== null && !d.isCorrect).length;
  const skippedCount = details.filter(d => d.chosenIndex === null).length;

  const total = details.length;
  const score = correctCount; // 1 point each (simple)
  const percent = total ? Math.round((score / total) * 100) : 0;

  const result = {
    meta: state.meta,
    score,
    percent,
    correctCount,
    wrongCount,
    skippedCount,
    details
  };

  localStorage.setItem("quizResult", JSON.stringify(result));
  window.location.href = "result.html";
}

function setupQuizPage() {
  let state = loadQuizState();
  if (!state) state = initQuizState();

  // If no questions available for that filter
  if (!state.questions || state.questions.length === 0) {
    byId("questionText").textContent = "No questions found for this category & difficulty. Go back and choose another.";
    byId("options").innerHTML = "";
    byId("prevBtn").disabled = true;
    byId("nextBtn").disabled = true;
    byId("submitBtn").disabled = true;
    byId("timer").textContent = "0";
    
      
    return;
  }

  renderQuestion(state);

  byId("prevBtn").addEventListener("click", () => {
    stopTimer();
    recordTimeSpent(state);
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      saveQuizState(state);
      renderQuestion(state);
    }
  });

  byId("nextBtn").addEventListener("click", () => {
    stopTimer();
    recordTimeSpent(state);
    if (state.currentIndex < state.meta.totalQuestions - 1) {
      state.currentIndex += 1;
      saveQuizState(state);
      renderQuestion(state);
    }
  });

  byId("submitBtn").addEventListener("click", () => {
    finalizeAndGoToResult(state);
  });

  // Optional: prevent accidental refresh losing state is handled by localStorage already
}

/* ---------------------- RESULT PAGE LOGIC ---------------------- */
function setupResultPage() {
  const raw = localStorage.getItem("quizResult");
  if (!raw) {
    // No result found, redirect
    window.location.href = "index.html";
    return;
  }

  const result = JSON.parse(raw);

  byId("totalScore").textContent = `${result.score} / ${result.details.length} (${result.percent}%)`;
  byId("correctCount").textContent = String(result.correctCount);
  byId("wrongCount").textContent = String(result.wrongCount);
  byId("skippedCount").textContent = String(result.skippedCount);

  // Charts
  const accCtx = document.getElementById("accuracyChart");
  const timeCtx = document.getElementById("timeChart");

  new Chart(accCtx, {
    type: "doughnut",
    data: {
      labels: ["Correct", "Incorrect", "Skipped"],
      datasets: [{
        data: [result.correctCount, result.wrongCount, result.skippedCount]
      }]
    },
    options: { responsive: true }
  });

  new Chart(timeCtx, {
    type: "bar",
    data: {
      labels: result.details.map((_, i) => `Q${i + 1}`),
      datasets: [{
        label: "Seconds",
        data: result.details.map(d => d.timeSpent || 0)
      }]
    },
    options: { responsive: true }
  });

  // Detailed review list
  const list = byId("detailList");
  list.innerHTML = "";

  result.details.forEach((d, i) => {
    const chosenText = d.chosenIndex === null ? "Skipped" : d.options[d.chosenIndex];
    const correctText = d.options[d.correctIndex];

    const item = document.createElement("div");
    item.className = "detailItem";
    item.setAttribute("data-testid", `detailItem-${i}`);

    item.innerHTML = `
      <div class="small"><b>Q${i + 1}</b> • Time: <b>${d.timeSpent}s</b></div>
      <div style="margin:8px 0;"><b>${escapeHtml(d.question)}</b></div>
      <div class="small">Your Answer: <b>${escapeHtml(chosenText)}</b></div>
      <div class="small">Correct Answer: <b>${escapeHtml(correctText)}</b></div>
      <div class="small">Result: <b>${d.isCorrect ? "Correct ✅" : (d.chosenIndex === null ? "Skipped ⏳" : "Incorrect ❌")}</b></div>
    `;

    list.appendChild(item);
  });

  byId("restartBtn").addEventListener("click", () => {
    localStorage.removeItem("quizState");
    localStorage.removeItem("quizResult");
    window.location.href = "index.html";
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------------- BOOTSTRAP ---------------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (isQuizPage()) setupQuizPage();
  if (isResultPage()) setupResultPage();
});