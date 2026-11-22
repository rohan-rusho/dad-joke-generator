/* Dad Joke Generator — new joke, copy, Groan-o-Meter. */
"use strict";

/* ---------- Pure logic (testable in node) ---------- */
function shuffledDeck(count) {
  const deck = [];
  for (let i = 0; i < count; i++) deck.push(i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function tallyLabel(rating, count) {
  const words = { groan: "groan", chuckle: "chuckle", legendary: "legendary" };
  const word = words[rating] || rating;
  return count + " " + word + (count === 1 ? "" : "s");
}

/* DOM BOOTSTRAP */
if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const jokeOutput = $("joke-output");
  const jokeText = $("joke-text");
  const jokeMeta = $("joke-meta");
  const jokeEmptyText = $("joke-empty-text");
  const newJokeBtn = $("new-joke-btn");
  const copyBtn = $("copy-btn");
  const heroTold = $("hero-told");

  const TALLY_KEY = "dad-joke-groan-tally";
  const TOLD_KEY = "dad-joke-told-count";
  const RATINGS = ["groan", "chuckle", "legendary"];

  let tally = { groan: 0, chuckle: 0, legendary: 0 };
  let told = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(TALLY_KEY) || "null");
    if (saved) tally = { groan: saved.groan | 0, chuckle: saved.chuckle | 0, legendary: saved.legendary | 0 };
    told = parseInt(localStorage.getItem(TOLD_KEY), 10) || 0;
  } catch (e) { /* storage unavailable — start fresh */ }

  let deck = shuffledDeck(DAD_JOKES.length);
  let currentJoke = null;
  let currentRated = false;

  function save() {
    try {
      localStorage.setItem(TALLY_KEY, JSON.stringify(tally));
      localStorage.setItem(TOLD_KEY, String(told));
    } catch (e) { /* storage unavailable */ }
  }

  function renderTally() {
    RATINGS.forEach((r) => {
      $("stat-" + r).textContent = tally[r];
      $("count-" + r).textContent = tallyLabel(r, tally[r]);
    });
    heroTold.textContent = told;
  }

  function setRatingEnabled(enabled) {
    RATINGS.forEach((r) => { $("rate-" + r).disabled = !enabled; });
    RATINGS.forEach((r) => $("rate-" + r).classList.remove("rated"));
  }

  function showJoke() {
    if (deck.length === 0) deck = shuffledDeck(DAD_JOKES.length);
    const idx = deck.pop();
    currentJoke = DAD_JOKES[idx];
    currentRated = false;
    told += 1;
    save();
    jokeOutput.classList.remove("is-empty");
    jokeEmptyText.hidden = true;
    jokeText.hidden = false;
    jokeMeta.hidden = false;
    jokeText.textContent = currentJoke;
    jokeText.classList.remove("pop");
    void jokeText.offsetWidth; // restart the pop animation
    jokeText.classList.add("pop");
    jokeMeta.textContent = "Joke #" + (idx + 1) + " of " + DAD_JOKES.length + " · " + told + " told so far";
    copyBtn.disabled = false;
    setRatingEnabled(true);
    renderTally();
  }

  function copyJoke() {
    if (!currentJoke) return;
    const done = () => showToast("📋 Joke copied — go inflict it on someone");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentJoke).then(done).catch(() => fallbackCopy(currentJoke, done));
    } else {
      fallbackCopy(currentJoke, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { showToast("Copy didn't work — select the joke text manually"); }
    document.body.removeChild(ta);
  }

  function rate(rating) {
    if (!currentJoke || currentRated) return;
    currentRated = true;
    tally[rating] += 1;
    save();
    renderTally();
    $("rate-" + rating).classList.add("rated");
    RATINGS.forEach((r) => { $("rate-" + r).disabled = true; });
    const reactions = {
      groan: "😖 Groan logged. That one physically hurt.",
      chuckle: "😄 Chuckle logged. Dad would be proud.",
      legendary: "🏆 Legendary! That's a hall-of-fame dad joke."
    };
    showToast(reactions[rating]);
  }

  newJokeBtn.addEventListener("click", showJoke);
  copyBtn.addEventListener("click", copyJoke);
  RATINGS.forEach((r) => $("rate-" + r).addEventListener("click", () => rate(r)));
  $("reset-tally-btn").addEventListener("click", () => {
    tally = { groan: 0, chuckle: 0, legendary: 0 };
    told = 0;
    save();
    renderTally();
    showToast("Groan-o-Meter reset");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === " " && document.activeElement === document.body) {
      e.preventDefault();
      showJoke();
    }
  });

  renderTally();
  initChrome();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}

function initChrome() {
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-menu");
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => menu.classList.remove("open")));
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}
