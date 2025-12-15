// main-ui.js
// UI and DOM wiring for Emoji Cipher, using PuzzlesData + GameEngine.

(function (global) {
  "use strict";

  const PuzzlesData = global.PuzzlesData;
  const GameEngine  = global.GameEngine;

  ///Easy/Hard Mode wiring
  const MODE_KEY = "emojiCipher.mode";
const MODES = { EASY: "easy", HARD: "hard" };

function loadMode() {
  const saved = localStorage.getItem(MODE_KEY);
  return saved === MODES.HARD ? MODES.HARD : MODES.EASY;
}

function saveMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
}


  // EmailJS constants. same as before
  const EMAILJS_SERVICE_ID  = "service_ushj1og";
  const EMAILJS_TEMPLATE_ID = "template_4hvk2cf";
  const EMAILJS_PUBLIC_KEY  = "LZgAKmmu1I5HBbyJy";

  if (global.emailjs && typeof global.emailjs.init === "function") {
    global.emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // -----------------------
  // PUZZLES from module
  // -----------------------
  const PUZZLES = PuzzlesData.getAllPuzzles();

  // -----------------------
  // GLOBAL STATE
  // -----------------------
  let currentIndex   = 0;
  let currentPuzzle  = PUZZLES[currentIndex];
  let playerState    = {};  // per puzzle, emoji -> { letter, number, solved }
  let hasCelebrated  = false;

  // DOM refs
  const phraseArea    = document.getElementById("phraseArea");
  const equationsArea = document.getElementById("equationsArea");
  const solutionLines = document.getElementById("solutionLines"); // optional
  const winBox        = document.getElementById("winBox");        // optional
  const prevBtn       = document.getElementById("prevBtn");
  const nextBtn       = document.getElementById("nextBtn");
  const puzzleLabel   = document.getElementById("puzzleLabel");
  const progressLabel = document.getElementById("progressLabel");

  let currentMode = loadMode();

function setMode(mode) {
  currentMode = mode;
  saveMode(mode);
  renderModeUI();

  // Later, we will call into the engine here to apply mode rules.
  // Example for next step: engine.setMode(currentMode);
  // For now, just keep UI and persistence correct.
}

function renderModeUI() {
  const easyBtn = document.getElementById("modeEasy");
  const hardBtn = document.getElementById("modeHard");
  if (!easyBtn || !hardBtn) return;

  const isEasy = currentMode === MODES.EASY;
  easyBtn.setAttribute("aria-pressed", String(isEasy));
  hardBtn.setAttribute("aria-pressed", String(!isEasy));
}

function initModeSelector() {
  const easyBtn = document.getElementById("modeEasy");
  const hardBtn = document.getElementById("modeHard");
  if (!easyBtn || !hardBtn) return;

  easyBtn.addEventListener("click", () => setMode(MODES.EASY));
  hardBtn.addEventListener("click", () => setMode(MODES.HARD));

  renderModeUI();
}

  // -----------------------
  // PROFILE HELPERS
  // -----------------------
  function getProfile() {
    return GameEngine.getProfile();
  }

  function isPuzzleCompletedEasy(puzzleId) {
    const profile = getProfile();
    const ps = profile.puzzles[puzzleId];
    return !!(ps && ps.completedEasy);
  }

  function getSolvedCount() {
    const profile = getProfile();
    let count = 0;
    for (const p of PUZZLES) {
      const ps = profile.puzzles[p.id];
      if (ps && (ps.completedEasy || (ps.bestStars && ps.bestStars > 0))) {
        count++;
      }
    }
    return count;
  }

  function updateProgressLabel() {
    if (!progressLabel) return;
    const solvedCount = getSolvedCount();
    const total = PUZZLES.length;
    progressLabel.textContent = `Solved ${solvedCount} / ${total}`;
  }

  // -----------------------
  // PLAYER STATE
  // -----------------------
  function initPlayerState() {
    playerState = {};
    currentPuzzle.uniqueEmojis.forEach(em => {
      playerState[em] = { letter: "", number: "", solved: false };
    });
    hasCelebrated = false;
  }

  // -----------------------
  // RENDER PHRASE
  // -----------------------
  function renderPhrase() {
    phraseArea.innerHTML = "";

    currentPuzzle.phraseWords.forEach((wordArr, wordIdx) => {
      const wordBlock = document.createElement("div");
      wordBlock.className = "word-block";

      const topRow = document.createElement("div");
      topRow.className = "word-top-row";

      wordArr.forEach((em, charIdx) => {
        const stack = document.createElement("div");
        stack.className = "char-stack";
        stack.dataset.emoji = em;
        stack.dataset.wordIndex = wordIdx;
        stack.dataset.charIndex = charIdx;

        const inp = document.createElement("input");
        inp.className = "char-input";
        inp.maxLength = 1;
        inp.placeholder = "_";
        inp.dataset.emoji = em;
        inp.dataset.kind = "letter";
        inp.addEventListener("input", handleGuessInput);

        const emDiv = document.createElement("div");
        emDiv.className = "char-emoji";
        emDiv.textContent = em;

        stack.appendChild(inp);
        stack.appendChild(emDiv);
        topRow.appendChild(stack);
      });

      wordBlock.appendChild(topRow);
      phraseArea.appendChild(wordBlock);

      if (wordIdx < currentPuzzle.phraseWords.length - 1) {
        const slash = document.createElement("div");
        slash.className = "word-separator";
        slash.textContent = "/";
        phraseArea.appendChild(slash);
      }
    });
  }

  // -----------------------
  // RENDER EQUATIONS
  // -----------------------
  function renderEquations() {
    equationsArea.innerHTML = "";

    currentPuzzle.equations.forEach((eqObj, eqIndex) => {
      const row = document.createElement("div");
      row.className = "equation-row";

      const leftWrap = document.createElement("div");
      leftWrap.className = "eq-left";

      eqObj.left.forEach(token => {
        if (token === "+") {
          const plus = document.createElement("div");
          plus.className = "eq-op";
          plus.textContent = "+";
          leftWrap.appendChild(plus);
        } else {
          const stack = document.createElement("div");
          stack.className = "eq-stack";
          stack.dataset.emoji = token;
          stack.dataset.eqIndex = eqIndex;

          const numInp = document.createElement("input");
          numInp.className = "num-input";
          numInp.maxLength = 1;
          numInp.placeholder = "_";
          numInp.dataset.emoji = token;
          numInp.dataset.kind = "number";
          numInp.addEventListener("input", handleGuessInput);

          const emDiv = document.createElement("div");
          emDiv.className = "char-emoji";
          emDiv.textContent = token;

          stack.appendChild(numInp);
          stack.appendChild(emDiv);
          leftWrap.appendChild(stack);
        }
      });

      const eqTarget = document.createElement("div");
      eqTarget.className = "eq-target";
      eqTarget.textContent = "= " + eqObj.target;

      const eqRes = document.createElement("div");
      eqRes.className = "eq-result status-bad";
      eqRes.dataset.eqIndex = eqIndex;
      eqRes.textContent = "❌";

      row.appendChild(leftWrap);
      row.appendChild(eqTarget);
      row.appendChild(eqRes);
      equationsArea.appendChild(row);
    });

    updateEquationsStatus();
  }

  // -----------------------
  // SOLUTION BOX (optional)
  // -----------------------
  function renderSolutionBox() {
    if (!solutionLines) return;
    solutionLines.innerHTML = "";
    currentPuzzle.uniqueEmojis.forEach(em => {
      const st = playerState[em];
      if (st && st.solved) {
        const line = document.createElement("div");
        line.className = "solution-line-solved";
        line.textContent = `${em} = ${st.letter} = ${st.number}`;
        solutionLines.appendChild(line);
      }
    });
  }

  // -----------------------
  // EQUATIONS STATUS
  // -----------------------
  function updateEquationsStatus() {
    currentPuzzle.equations.forEach((eqObj, eqIndex) => {
      let allKnown = true;
      let total = 0;

      eqObj.left.forEach(token => {
        if (token === "+") return;
        if (playerState[token].solved) {
          total += currentPuzzle.mapping[token].number;
        } else {
          allKnown = false;
        }
      });

      const resDiv = equationsArea.querySelector(`.eq-result[data-eq-index="${eqIndex}"]`);
      if (!resDiv) return;

      if (allKnown && total === eqObj.target) {
        resDiv.textContent = "✅";
        resDiv.classList.remove("status-bad");
        resDiv.classList.add("status-ok");
      } else {
        resDiv.textContent = "❌";
        resDiv.classList.remove("status-ok");
        resDiv.classList.add("status-bad");
      }
    });
  }

  // -----------------------
  // CURRENT SOLVED PHRASE
  // -----------------------
  function getCurrentSolvedPhrase() {
    const wordsSolved = currentPuzzle.phraseWords.map(wordArr => {
      return wordArr.map(em => {
        if (playerState[em].solved) {
          return currentPuzzle.mapping[em].letter;
        } else {
          return "_";
        }
      }).join("");
    });
    return wordsSolved.join(" ");
  }

  // -----------------------
  // INPUT HANDLER
  // -----------------------
  function handleGuessInput(e) {
    const em   = e.target.dataset.emoji;
    const kind = e.target.dataset.kind;

    if (playerState[em].solved) {
      syncSolvedEmojiEverywhere(em);
      updateEquationsStatus();
      checkWin();
      return;
    }

    let val = e.target.value;

    if (kind === "letter") {
      val = val.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
      e.target.value = val;
    } else {
      if (val !== "") {
        let n = parseInt(val, 10);
        if (isNaN(n)) n = "";
        if (n < 0) n = 0;
        if (n > 9) n = 9;
        e.target.value = n === "" ? "" : String(n);
        val = e.target.value;
      }
    }

    const correctLetter = currentPuzzle.mapping[em].letter;
    const correctNumber = currentPuzzle.mapping[em].number.toString();

    if (kind === "letter" && val === correctLetter) {
      playerState[em].letter = correctLetter;
      playerState[em].number = correctNumber;
      playerState[em].solved = true;
    } else if (kind === "number" && val === correctNumber) {
      playerState[em].letter = correctLetter;
      playerState[em].number = correctNumber;
      playerState[em].solved = true;
    }

    if (playerState[em].solved) {
      syncSolvedEmojiEverywhere(em);
      updateEquationsStatus();
      renderSolutionBox();
    }

    checkWin();
  }

  // -----------------------
  // SYNC SOLVED EMOJI
  // -----------------------
  function syncSolvedEmojiEverywhere(em) {
    const st = playerState[em];
    if (!st) return;

    const solvedLetter = st.letter;
    const solvedNumber = st.number;

    phraseArea
      .querySelectorAll(`.char-stack[data-emoji="${em}"] .char-input`)
      .forEach(inp => {
        inp.value = solvedLetter;
        inp.disabled = true;
      });

    equationsArea
      .querySelectorAll(`.eq-stack[data-emoji="${em}"] .num-input`)
      .forEach(inp => {
        inp.value = solvedNumber;
        inp.disabled = true;
      });
  }

  // -----------------------
  // CONFETTI
  // -----------------------
  function launchConfetti() {
    if (hasCelebrated) return;
    hasCelebrated = true;

    const msg = document.getElementById("solvedMessage");
    if (msg) {
      msg.classList.add("show");
      setTimeout(() => { msg.classList.remove("show"); }, 2500);
    }

    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const EMOJIS = [
      "🎉","🎊","✨","💥","💫","🌟","🔥","🤩","😎","🦄",
      "🦊","🐸","🪐","🎲","🚀","★","🔮","🧊","🐙","🌸",
      "🦩","🐢","🪼","🐍","🏵️","🎈","🥳","🪻","💐"
    ];

    function makeEmojiSprite(char, sizePx) {
      const off = document.createElement("canvas");
      const offCtx = off.getContext("2d");
      const pad = sizePx;
      off.width = sizePx + pad * 2;
      off.height = sizePx + pad * 2;
      offCtx.font = `${sizePx}px sans-serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText(char, off.width / 2, off.height / 2);
      return { canvas: off, w: off.width, h: off.height };
    }

    const SPRITES = [];
    for (let i = 0; i < EMOJIS.length; i++) {
      const sizePx = 28 + Math.random() * 10;
      SPRITES.push(makeEmojiSprite(EMOJIS[i], sizePx));
    }

    const particles = [];
    const COUNT = 90;

    const originX = canvas.width * 0.5;
    const originY = canvas.height * 0.9;

    for (let i = 0; i < COUNT; i++) {
      const sprite = SPRITES[Math.floor(Math.random() * SPRITES.length)];

      const angleDeg = -150 + Math.random() * 120;
      const angleRad = angleDeg * Math.PI / 180;

      const speed = 550 + Math.random() * 450;
      const vx = Math.cos(angleRad) * speed;
      const vy = Math.sin(angleRad) * speed;

      const spinSpeed = (Math.random() * 720 - 360);
      const life = 2200 + Math.random() * 400;

      const startX = originX + (Math.random() - 0.5) * 30;
      const startY = originY + (Math.random() - 0.5) * 15;

      particles.push({
        sprite,
        x: startX,
        y: startY,
        vx,
        vy,
        spin: 0,
        spinSpeed,
        scaleStart: 1.0,
        scaleEnd: 0.5,
        alpha: 1,
        age: 0,
        life,
        dead: false
      });
    }

    let running = true;
    let prevTS = performance.now();

    function frame(now) {
      if (!running) return;
      const dt = now - prevTS;
      prevTS = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;

      for (const p of particles) {
        if (p.dead) continue;

        p.age += dt;
        if (p.age >= p.life) {
          p.dead = true;
          continue;
        }
        aliveCount++;

        const tNorm = p.age / p.life;

        p.x += p.vx * (dt / 1000);
        p.y += p.vy * (dt / 1000);

        p.spin += p.spinSpeed * (dt / 1000);

        const scale = p.scaleStart + (p.scaleEnd - p.scaleStart) * tNorm;

        let alpha;
        if (tNorm < 0.7) {
          alpha = 1;
        } else {
          const tail = (tNorm - 0.7) / 0.3;
          alpha = 1 - tail;
          if (alpha < 0) alpha = 0;
        }
        p.alpha = alpha;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin * Math.PI / 180);
        ctx.scale(scale, scale);
        ctx.drawImage(
          p.sprite.canvas,
          -p.sprite.w / 2,
          -p.sprite.h / 2,
          p.sprite.w,
          p.sprite.h
        );
        ctx.restore();
      }

      if (aliveCount === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        running = false;
        return;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  // -----------------------
  // CHECK WIN
  // -----------------------
  function checkWin() {
    const finalPhrase = getCurrentSolvedPhrase();
    const phraseDone = (finalPhrase === currentPuzzle.phrase);

    let allEqCorrect = true;
    currentPuzzle.equations.forEach((eqObj, eqIndex) => {
      const resDiv = equationsArea.querySelector(`.eq-result[data-eq-index="${eqIndex}"]`);
      if (!resDiv || !resDiv.classList.contains("status-ok")) {
        allEqCorrect = false;
      }
    });

    if (phraseDone && allEqCorrect) {
      // mark solved in GameEngine as Easy completion
      GameEngine.completePuzzleEasy(currentPuzzle.id);

      if (winBox) {
        winBox.style.display = "block";
      }
      if (!hasCelebrated) {
        launchConfetti();
      }

      updateProgressLabel();
    } else {
      if (winBox) {
        winBox.style.display = "none";
      }
    }
  }

  // -----------------------
  // AUTOFILL IF SOLVED BEFORE
  // -----------------------
  function autofillIfSolved() {
    if (!isPuzzleCompletedEasy(currentPuzzle.id)) return;

    currentPuzzle.uniqueEmojis.forEach(em => {
      const def = currentPuzzle.mapping[em];
      playerState[em].solved  = true;
      playerState[em].letter  = def.letter;
      playerState[em].number  = def.number.toString();
    });

    currentPuzzle.uniqueEmojis.forEach(em => {
      syncSolvedEmojiEverywhere(em);
    });

    updateEquationsStatus();
    renderSolutionBox();
    checkWin();
  }

  // -----------------------
  // LOAD PUZZLE
  // -----------------------
  function loadPuzzle(newIndex) {
    if (newIndex < 0) newIndex = 0;
    if (newIndex > PUZZLES.length - 1) newIndex = PUZZLES.length - 1;

    currentIndex  = newIndex;
    currentPuzzle = PUZZLES[currentIndex];

    PlayerState();
    renderPhrase();
    renderEquations();
    renderSolutionBox();
    updateEquationsStatus();
    autofillIfSolved();

    if (puzzleLabel) {
      puzzleLabel.textContent = `Puzzle ${currentIndex + 1} / ${PUZZLES.length}`;
    }
    updateProgressLabel();
  }

  // -----------------------
  // SHARE BUTTON
  // -----------------------
  function initShare() {
    const shareBtn    = document.getElementById("shareBtn");
    const shareStatus = document.getElementById("shareStatus");

    function getShareUrl() {
      const origin = window.location.origin;
      const path   = window.location.pathname;
      return origin + path;
    }

    async function copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        const temp = document.createElement("textarea");
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(temp);
        return ok;
      }
    }

    async function doShare() {
      const url = getShareUrl();
      const solvedCount = getSolvedCount();
      const total = PUZZLES.length;
      const message = `I solved ${solvedCount}/${total} Emoji Cipher™ puzzles! Try it out: ${url}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Emoji Cipher™",
            text: `I solved ${solvedCount}/${total} Emoji Cipher™ puzzles!🎉🥳 Try it:`,
            url: url
          });
          showCopiedUI("Link ready to share!");
          return;
        } catch (err) {
          // fall through to clipboard
        }
      }

      const ok = await copyToClipboard(message);

      if (ok) {
        showCopiedUI("Copied!");
      } else {
        showCopiedUI("Copy manually ↓");
        if (shareStatus) {
          shareStatus.textContent = url;
        }
      }
    }

    function showCopiedUI(statusText) {
      if (!shareBtn || !shareStatus) return;
      const originalBtnText = shareBtn.textContent;
      shareBtn.textContent = "Copied!";

      shareStatus.textContent = statusText || "Copied!";
      shareStatus.style.display = "block";

      setTimeout(() => {
        shareBtn.textContent = originalBtnText;
        shareStatus.style.display = "none";
      }, 2000);
    }

    if (shareBtn) {
      shareBtn.addEventListener("click", doShare);
    }
  }

  // -----------------------
  // FEEDBACK BUTTON
  // -----------------------
  function initFeedback() {
    const sendFeedbackBtn = document.getElementById("sendFeedbackBtn");
    const feedbackStatus  = document.getElementById("feedbackStatus");

    if (!sendFeedbackBtn || !feedbackStatus) {
      return;
    }

    sendFeedbackBtn.addEventListener("click", () => {
      const msgEl   = document.getElementById("feedbackText");
      const emailEl = document.getElementById("feedbackEmail");

      const msgRaw   = msgEl?.value || "";
      const emailRaw = emailEl?.value || "";

      const cleanMsg   = msgRaw.trim();
      const cleanEmail = emailRaw.trim();

      if (!cleanMsg) {
        feedbackStatus.style.display = "block";
        feedbackStatus.style.color = "#b00020";
        feedbackStatus.textContent = "Please tell me something first 🙂";
        return;
      }

      const solvedCount = getSolvedCount();
      const totalCount  = PUZZLES.length;

      const templateParams = {
        message: cleanMsg,
        player_email: cleanEmail || "(no email given)",
        solve_progress: `${solvedCount} / ${totalCount}`,
        puzzle_index: `Puzzle ${currentIndex + 1} of ${totalCount}`
      };

      if (typeof global.emailjs === "undefined") {
        feedbackStatus.style.display = "block";
        feedbackStatus.style.color = "#b00020";
        feedbackStatus.textContent = "Feedback is offline right now.";
        console.error("EmailJS is not defined.");
        return;
      }

      global.emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(() => {
          feedbackStatus.style.display = "block";
          feedbackStatus.style.color = "#108a00";
          feedbackStatus.textContent = "Thanks! Your feedback was sent ✅";
          if (msgEl) msgEl.value = "";
        })
        .catch(err => {
          feedbackStatus.style.display = "block";
          feedbackStatus.style.color = "#b00020";
          feedbackStatus.textContent = "Something went wrong. Try again?";
          console.error("EmailJS error:", err);
        });
    });
  }

  // -----------------------
  // INIT
  // -----------------------
  function init() {
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        loadPuzzle(currentIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        loadPuzzle(currentIndex + 1);
      });
    }

    initModeSelector();
    initShare();
    initFeedback();
    loadPuzzle(0);
  }

  init();

})(window);
