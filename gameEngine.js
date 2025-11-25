// gameEngine.js
// Core Emoji Cipher logic. UI stays separate in main-ui.js

(function (global) {
  "use strict";

  const STORAGE_KEY_PROFILE = "emojiCipherProfileV1";

  const EFFECTIVE_LIVES_START = 5;
  const MAX_LIFE_BONUS = 100;
  const TARGET_TIME_SECONDS = 120;
  const MAX_TIME_BONUS = 100;
  const BASE_SCORE = 100;

  const STAR_THRESHOLDS = {
    three: 260,
    two: 180,
    one: 120
  };

  // Profile shape.
  // {
  //   freeHintsRemaining,
  //   paidHintsBalance,
  //   selectedMode,        "easy" or "hard"
  //   brutalModeOn,        boolean
  //   puzzles: {
  //     [id]: {
  //       unlocked,
  //       completedEasy,
  //       bestScore,
  //       bestStars,
  //       bestTimeSeconds,
  //       bestLivesLeft,
  //       bestWasBrutalMode,
  //       hasIncompleteHard,
  //       savedHardState: {...}
  //     }
  //   }
  // }

  function getDefaultProfile() {
    const all = global.PuzzlesData.getAllPuzzles();
    const puzzlesState = {};
    if (all.length > 0) {
      puzzlesState[all[0].id] = { unlocked: true };
    }
    return {
      freeHintsRemaining: 3,
      paidHintsBalance: 0,
      selectedMode: "easy",
      brutalModeOn: false,
      puzzles: puzzlesState
    };
  }

  function loadProfile() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY_PROFILE);
      if (!raw) return getDefaultProfile();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return getDefaultProfile();
      }
      if (!parsed.puzzles) parsed.puzzles = {};
      if (typeof parsed.freeHintsRemaining !== "number") parsed.freeHintsRemaining = 3;
      if (typeof parsed.paidHintsBalance !== "number") parsed.paidHintsBalance = 0;
      if (!parsed.selectedMode) parsed.selectedMode = "easy";
      if (typeof parsed.brutalModeOn !== "boolean") parsed.brutalModeOn = false;
      return parsed;
    } catch (e) {
      console.error("Failed to load profile", e);
      return getDefaultProfile();
    }
  }

  function saveProfile(profile) {
    try {
      global.localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn("Failed to save profile", e);
    }
  }

  let profile = loadProfile();

  function getProfileSnapshot() {
    return JSON.parse(JSON.stringify(profile));
  }

  function ensurePuzzleProfile(puzzleId) {
    if (!profile.puzzles[puzzleId]) {
      profile.puzzles[puzzleId] = {
        unlocked: false,
        completedEasy: false,
        bestScore: null,
        bestStars: 0,
        bestTimeSeconds: null,
        bestLivesLeft: null,
        bestWasBrutalMode: false,
        hasIncompleteHard: false,
        savedHardState: null
      };
    }
    return profile.puzzles[puzzleId];
  }

  function unlockNextPuzzles(currentId) {
    const nextList = global.PuzzlesData.getNextPuzzlesToUnlock(currentId);
    nextList.forEach(p => {
      const pState = ensurePuzzleProfile(p.id);
      pState.unlocked = true;
    });
  }

  function setMode(mode) {
    if (mode !== "easy" && mode !== "hard") return;
    profile.selectedMode = mode;
    saveProfile(profile);
  }

  function setBrutalMode(on) {
    profile.brutalModeOn = !!on;
    saveProfile(profile);
  }

  function getCurrentMode() {
    return profile.selectedMode;
  }

  function getBrutalMode() {
    return profile.brutalModeOn;
  }

  function startHardRun(puzzleId, opts) {
    const puzzle = global.PuzzlesData.getPuzzleById(puzzleId);
    if (!puzzle) throw new Error("Unknown puzzle " + puzzleId);

    const pState = ensurePuzzleProfile(puzzleId);
    pState.unlocked = true;

    const brutal = opts && opts.brutalMode != null ? !!opts.brutalMode : profile.brutalModeOn;

    pState.savedHardState = {
      puzzleId,
      brutalMode: brutal,
      livesStart: EFFECTIVE_LIVES_START,
      livesGranted: 0,
      livesLeft: EFFECTIVE_LIVES_START,
      solvedLetters: {},    // emoji -> true
      solvedNumbers: {},    // emoji -> true
      startedAtMs: Date.now(),
      endedAtMs: null,
      abandoned: false,
      failed: false
    };
    pState.hasIncompleteHard = true;
    saveProfile(profile);

    return getHardViewState(puzzleId);
  }

  function resumeHardRun(puzzleId) {
    const pState = ensurePuzzleProfile(puzzleId);
    if (!pState.savedHardState) {
      return startHardRun(puzzleId);
    }
    return getHardViewState(puzzleId);
  }

  function getHardViewState(puzzleId) {
    const puzzle = global.PuzzlesData.getPuzzleById(puzzleId);
    const pState = ensurePuzzleProfile(puzzleId);
    const hard = pState.savedHardState;

    if (!hard) return null;

    const solvedLetters = Object.assign({}, hard.solvedLetters);
    const solvedNumbers = Object.assign({}, hard.solvedNumbers);

    const nowMs = Date.now();
    const effectiveEnd = hard.endedAtMs || nowMs;
    const elapsedSeconds = Math.max(0, Math.floor((effectiveEnd - hard.startedAtMs) / 1000));

    return {
      puzzleId,
      brutalMode: hard.brutalMode,
      livesLeft: hard.livesLeft,
      livesStart: hard.livesStart,
      livesGranted: hard.livesGranted,
      elapsedSeconds,
      solvedLetters,
      solvedNumbers,
      abandoned: hard.abandoned,
      failed: hard.failed
    };
  }

  function isEmojiCorrectLetter(puzzle, emoji, guess) {
    const def = puzzle.mapping[emoji];
    if (!def) return false;
    return String(def.letter).toUpperCase() === String(guess).toUpperCase();
  }

  function isEmojiCorrectNumber(puzzle, emoji, guess) {
    const def = puzzle.mapping[emoji];
    if (!def) return false;
    return Number(def.number) === Number(guess);
  }

  function markSolvedPair(hard, puzzle, emoji, kind) {
    if (!puzzle.mapping[emoji]) return;
    if (kind === "letter" || kind === "both") {
      hard.solvedLetters[emoji] = true;
    }
    if (kind === "number" || kind === "both") {
      hard.solvedNumbers[emoji] = true;
    }
  }

  function allPhraseLettersSolved(puzzle, hard) {
    for (const word of puzzle.phraseWords) {
      for (const emoji of word) {
        if (!hard.solvedLetters[emoji]) {
          return false;
        }
      }
    }
    return true;
  }

  function evaluateEquationsSatisfied(puzzle, hard) {
    for (const eq of puzzle.equations) {
      let sum = 0;
      for (const token of eq.left) {
        if (token === "+") continue;
        const def = puzzle.mapping[token];
        if (!def) return false;
        sum += Number(def.number);
      }
      if (sum !== eq.target) return false;
    }
    return true;
  }

  function isPuzzleSolved(puzzle, hard) {
    return allPhraseLettersSolved(puzzle, hard) && evaluateEquationsSatisfied(puzzle, hard);
  }

  function submitGuessHard(puzzleId, params) {
    const puzzle = global.PuzzlesData.getPuzzleById(puzzleId);
    if (!puzzle) throw new Error("Unknown puzzle " + puzzleId);

    const pState = ensurePuzzleProfile(puzzleId);
    if (!pState.savedHardState) {
      startHardRun(puzzleId);
    }
    const hard = pState.savedHardState;

    const emoji = params.emoji;
    const kind = params.kind === "number" ? "number" : "letter";
    const value = params.value;

    const brutal = hard.brutalMode;

    const correct = kind === "letter"
      ? isEmojiCorrectLetter(puzzle, emoji, value)
      : isEmojiCorrectNumber(puzzle, emoji, value);

    let lifeLost = false;

    if (correct) {
      markSolvedPair(hard, puzzle, emoji, "both");
    } else {
      const shouldLoseLife = brutal || !!params.confirm;
      if (shouldLoseLife && hard.livesLeft > 0) {
        hard.livesLeft -= 1;
        lifeLost = true;
        if (hard.livesLeft <= 0) {
          hard.failed = true;
          hard.endedAtMs = Date.now();
        }
      }
    }

    const solvedNow = !hard.failed && isPuzzleSolved(puzzle, hard);
    let solvedState = null;

    if (solvedNow) {
      hard.endedAtMs = Date.now();
      pState.hasIncompleteHard = false;

      const elapsedSeconds = Math.max(0, Math.floor((hard.endedAtMs - hard.startedAtMs) / 1000));
      const scoreInfo = computeScoreAndStars(hard, elapsedSeconds);
      updateBestHardStats(pState, hard, elapsedSeconds, scoreInfo);
      unlockNextPuzzles(puzzleId);
      saveProfile(profile);

      solvedState = {
        finalScore: scoreInfo.finalScore,
        stars: scoreInfo.stars,
        elapsedSeconds,
        livesLeft: hard.livesLeft,
        brutalMode: hard.brutalMode
      };
    }

    saveProfile(profile);

    return {
      correct,
      lifeLost,
      livesLeft: hard.livesLeft,
      failed: hard.failed,
      solved: solvedNow,
      hardView: getHardViewState(puzzleId),
      solvedState
    };
  }

  function computeScoreAndStars(hard, timeSeconds) {
    const livesUsed = hard.livesStart + hard.livesGranted - hard.livesLeft;
    const effectiveLivesRemaining = Math.max(0, EFFECTIVE_LIVES_START - livesUsed);
    const lifeScore = (effectiveLivesRemaining / EFFECTIVE_LIVES_START) * MAX_LIFE_BONUS;

    const timeRatio = (TARGET_TIME_SECONDS - timeSeconds) / TARGET_TIME_SECONDS;
    const timeScore = clamp(timeRatio, 0, 1) * MAX_TIME_BONUS;

    const brutalMultiplier = hard.brutalMode ? 1.1 : 1.0;

    const performanceScore = (lifeScore + timeScore) * brutalMultiplier;
    const finalScore = Math.round(BASE_SCORE + performanceScore);

    let stars = 0;
    if (finalScore >= STAR_THRESHOLDS.three) stars = 3;
    else if (finalScore >= STAR_THRESHOLDS.two) stars = 2;
    else if (finalScore >= STAR_THRESHOLDS.one) stars = 1;

    return { finalScore, stars };
  }

  function updateBestHardStats(pState, hard, timeSeconds, scoreInfo) {
    if (pState.bestScore == null || scoreInfo.finalScore > pState.bestScore) {
      pState.bestScore = scoreInfo.finalScore;
    }
    if (!pState.bestStars || scoreInfo.stars > pState.bestStars) {
      pState.bestStars = scoreInfo.stars;
    }
    if (pState.bestTimeSeconds == null || timeSeconds < pState.bestTimeSeconds) {
      pState.bestTimeSeconds = timeSeconds;
    }
    if (pState.bestLivesLeft == null || hard.livesLeft > pState.bestLivesLeft) {
      pState.bestLivesLeft = hard.livesLeft;
    }
    if (scoreInfo.stars > 0) {
      pState.bestWasBrutalMode = !!hard.brutalMode;
    }
  }

  function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  function abandonHardPuzzle(puzzleId) {
    const pState = ensurePuzzleProfile(puzzleId);
    if (!pState.savedHardState) return;
    const hard = pState.savedHardState;
    hard.abandoned = true;
    if (!hard.endedAtMs) hard.endedAtMs = Date.now();
    pState.hasIncompleteHard = true;
    saveProfile(profile);
  }

  function grantExtraLife(puzzleId) {
    const pState = ensurePuzzleProfile(puzzleId);
    if (!pState.savedHardState) {
      startHardRun(puzzleId);
    }
    const hard = pState.savedHardState;
    hard.livesGranted += 1;
    hard.livesLeft += 1;
    if (hard.livesLeft > 0) {
      hard.failed = false;
    }
    saveProfile(profile);
    return getHardViewState(puzzleId);
  }

  function completePuzzleEasy(puzzleId) {
    const pState = ensurePuzzleProfile(puzzleId);
    pState.unlocked = true;
    pState.completedEasy = true;
    unlockNextPuzzles(puzzleId);
    saveProfile(profile);
  }

  function useHint(puzzleId, params) {
    const kind = params.kind; // "letter" | "number" | "context"
    const emoji = params.emoji || null;
    const puzzle = global.PuzzlesData.getPuzzleById(puzzleId);
    if (!puzzle) throw new Error("Unknown puzzle " + puzzleId);

    if (profile.freeHintsRemaining > 0) {
      profile.freeHintsRemaining -= 1;
    } else if (profile.paidHintsBalance > 0) {
      profile.paidHintsBalance -= 1;
    } else {
      return { ok: false, reason: "no_hints" };
    }

    let revealed = null;

    if (kind === "context") {
      revealed = { type: "context", text: puzzle.contextHint };
    } else if (kind === "letter" && emoji && puzzle.mapping[emoji]) {
      revealed = { type: "letter", emoji, value: puzzle.mapping[emoji].letter };
    } else if (kind === "number" && emoji && puzzle.mapping[emoji]) {
      revealed = { type: "number", emoji, value: puzzle.mapping[emoji].number };
    } else {
      return { ok: false, reason: "invalid_params" };
    }

    saveProfile(profile);
    return {
      ok: true,
      revealed,
      freeHintsRemaining: profile.freeHintsRemaining,
      paidHintsBalance: profile.paidHintsBalance
    };
  }

  function addPaidHints(amount) {
    const n = Number(amount) || 0;
    if (n <= 0) return getProfileSnapshot();
    profile.paidHintsBalance += n;
    saveProfile(profile);
    return getProfileSnapshot();
  }

  function resetProfileForDebug() {
    profile = getDefaultProfile();
    saveProfile(profile);
  }

  global.GameEngine = {
    getProfile: getProfileSnapshot,
    setMode,
    getCurrentMode,
    setBrutalMode,
    getBrutalMode,

    ensurePuzzleProfile,
    startHardRun,
    resumeHardRun,
    getHardViewState,
    submitGuessHard,
    abandonHardPuzzle,
    grantExtraLife,

    completePuzzleEasy,

    useHint,
    addPaidHints,

    resetProfileForDebug
  };

})(window);
