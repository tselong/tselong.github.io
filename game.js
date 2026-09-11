/* =========================================================
   火龍出巡 · Fire Dragon Checkpoint Hunt — GAME LOGIC
   ---------------------------------------------------------
   Reads CHECKPOINTS / GAME_CONFIG from data.js, tracks
   progress in localStorage, and renders every screen.
   Plain script, no build step, no framework.
   ========================================================= */

(function () {
  "use strict";

  var STORAGE_KEY = "fireDragonHunt_v1";

  /* ---------------- bilingual UI strings ---------------- */
  /* Checkpoint/game content strings live in data.js as {en, zh}
     pairs; this dictionary covers everything else in the UI. */

  var STRINGS = {
    en: {
      nicknameBlurb: "Help the fire dragon light its way through the LRC. Find four checkpoints, solve a question at each, then borrow a book to complete the journey.",
      checkpointFoundNote: "You found a checkpoint! Enter your name to start your journey.",
      nicknameLabel: "What should the dragon call you?",
      nicknamePlaceholder: "Your name or nickname",
      beginBtn: "Begin the Hunt 🐉",
      checkpointBadge: "🐉 Dragon Checkpoint #{n}",
      leadText: "The dragon has reached a new checkpoint.",
      notQuite: "Not quite — give it another try!",
      youFound: "You found the {icon} {name}!",
      nextClueLabel: "📜 Your next clue",
      continueBtn: "Continue Your Journey",
      alreadyFound: "You already found the {icon} {name} ✅",
      keepExploring: "Keep exploring the LRC to find the other checkpoints.",
      backBtn: "Back to Your Journey",
      invalidTitle: "🐉 This checkpoint isn't part of the hunt",
      invalidBody: "The QR code doesn't match a checkpoint in the current hunt. Double-check the code, or head back to your journey.",
      journeyComplete: "🎉 The journey is complete, {name}!",
      keepScreenOpen: "📸 Keep this screen open, or take a screenshot, to show at the counter.",
      playAgainBtn: "Play Again 🔁",
      playAgainConfirm: "Play again? You'll need to solve all four checkpoints again — make sure you've already shown this screen at the counter.",
      checkpointsFound: "{done} of {total} checkpoints found",
      findSpot: "Find this spot in the LRC and scan its QR code.",
      beginJourneyLabel: "🐉 Begin your journey",
      lookForQr: "Look for a glowing QR code hidden somewhere in the LRC to find your first checkpoint.",
      restartLink: "Restart my journey",
      restartConfirm: "Restart your journey? This will erase your name and progress on this device.",
      clueGivenLabel: "Clue given",
      dragonAriaLabel: "Fire dragon with {lit} of {total} scales lit",
      langToggle: "中文"
    },
    zh: {
      nicknameBlurb: "幫助火龍點亮牠在LRC的旅程。找到四個任務點,在每個任務點答對問題,然後借閱一本書完成旅程。",
      checkpointFoundNote: "你找到一個任務點了!請輸入你的名字,開始你的旅程。",
      nicknameLabel: "火龍應該怎麼稱呼你?",
      nicknamePlaceholder: "你的名字或暱稱",
      beginBtn: "開始尋寶 🐉",
      checkpointBadge: "🐉 火龍任務點 #{n}",
      leadText: "火龍來到了一個新的任務點。",
      notQuite: "不太對,再試一次吧!",
      youFound: "你找到了{icon} {name}!",
      nextClueLabel: "📜 你的下一個提示",
      continueBtn: "繼續你的旅程",
      alreadyFound: "你已經找到{icon} {name}了 ✅",
      keepExploring: "繼續探索LRC,尋找其他任務點吧。",
      backBtn: "返回你的旅程",
      invalidTitle: "🐉 這個任務點不屬於本次尋寶遊戲",
      invalidBody: "這個QR code與本次尋寶遊戲的任務點不符。請確認QR code是否正確,或返回你的旅程。",
      journeyComplete: "🎉 旅程完成了,{name}!",
      keepScreenOpen: "📸 請保持此畫面開啟,或截圖,以便在櫃檯出示。",
      playAgainBtn: "再玩一次 🔁",
      playAgainConfirm: "要再玩一次嗎?你需要重新完成全部四個任務點——請先確認你已經在櫃檯出示過這個畫面。",
      checkpointsFound: "已找到 {done}/{total} 個任務點",
      findSpot: "在LRC裡找到這個地方,掃描它的QR code。",
      beginJourneyLabel: "🐉 開始你的旅程",
      lookForQr: "在LRC裡尋找一個發光的QR code,找出你的第一個任務點。",
      restartLink: "重新開始旅程",
      restartConfirm: "要重新開始旅程嗎?這將會清除此裝置上的名字和進度。",
      clueGivenLabel: "已有提示",
      dragonAriaLabel: "火龍已點亮 {lit}/{total} 片龍鱗",
      langToggle: "EN"
    }
  };

  var currentLang = "en";

  function t(key, vars) {
    var dict = STRINGS[currentLang] || STRINGS.en;
    var str = dict[key] != null ? dict[key] : STRINGS.en[key] || "";
    if (vars) {
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          str = str.split("{" + k + "}").join(vars[k]);
        }
      }
    }
    return str;
  }

  // Picks the current-language value out of a data.js {en, zh} pair.
  function pick(bilingual) {
    if (bilingual == null) return "";
    return bilingual[currentLang] != null ? bilingual[currentLang] : bilingual.en;
  }

  /* ---------------- state ---------------- */

  function defaultState() {
    return {
      nickname: "",
      completed: [],   // checkpoint ids, in the order THIS player solved them
      answers: {},     // { [checkpointId]: { attempts: number } }
      score: 0,
      pendingClue: null, // { checkpointId, text: {en,zh} } | null
      lang: "en"
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      var state = defaultState();
      for (var key in state) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          state[key] = parsed[key];
        }
      }
      return state;
    } catch (e) {
      return defaultState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage may be unavailable (private browsing, storage full, etc).
      // The current screen still works; progress just won't persist.
      console.warn("Fire Dragon Hunt: could not save progress.", e);
    }
  }

  function resetForPlayAgain() {
    var state = loadState();
    state.completed = [];
    state.answers = {};
    state.score = 0;
    state.pendingClue = null;
    // nickname and lang are intentionally kept
    saveState(state);
  }

  function getCheckpointParam() {
    var params = new URLSearchParams(window.location.search);
    var raw = params.get("checkpoint");
    return raw ? raw.trim().toUpperCase() : null;
  }

  function findCheckpoint(id) {
    for (var i = 0; i < CHECKPOINTS.length; i++) {
      if (CHECKPOINTS[i].id === id) return CHECKPOINTS[i];
    }
    return null;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function pickNextClue(state) {
    var remaining = [];
    for (var i = 0; i < CHECKPOINTS.length; i++) {
      var id = CHECKPOINTS[i].id;
      if (state.completed.indexOf(id) === -1) remaining.push(id);
    }
    if (remaining.length === 0) return null;
    var chosenId = remaining[Math.floor(Math.random() * remaining.length)];
    return { checkpointId: chosenId, text: findCheckpoint(chosenId).clue };
  }

  function recordAnswer(state, checkpointId, correct) {
    if (!state.answers[checkpointId]) state.answers[checkpointId] = { attempts: 0 };
    state.answers[checkpointId].attempts += 1;
    if (correct) {
      state.completed.push(checkpointId);
      state.score += GAME_CONFIG.pointsPerCheckpoint || 25;
      state.pendingClue = pickNextClue(state);
    }
    saveState(state);
  }

  /* ---------------- rendering helpers ---------------- */

  var appEl = document.getElementById("app");

  function langBarHtml() {
    return (
      '<div class="lang-bar">' +
      '<button class="lang-toggle" id="langToggle" type="button">' +
      escapeHtml(t("langToggle")) +
      "</button>" +
      "</div>"
    );
  }

  function render(html) {
    appEl.innerHTML = langBarHtml() + html;
    var langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        var state = loadState();
        state.lang = currentLang === "en" ? "zh" : "en";
        saveState(state);
        currentLang = state.lang;
        route();
      });
    }
    window.scrollTo(0, 0);
  }

  function goHome() {
    window.location.href = window.location.pathname;
  }

  function renderStars() {
    var starsEl = document.getElementById("stars");
    if (!starsEl) return;
    var html = "";
    for (var i = 0; i < 30; i++) {
      var left = (Math.random() * 100).toFixed(1);
      var top = (Math.random() * 55).toFixed(1);
      var delay = (Math.random() * 3).toFixed(2);
      var size = Math.random() < 0.2 ? 3 : 2;
      html +=
        '<span class="star" style="left:' + left + "%; top:" + top +
        "%; width:" + size + "px; height:" + size + "px; animation-delay:" +
        delay + 's;"></span>';
    }
    starsEl.innerHTML = html;
  }

  /* ---------------- dragon hero artwork ---------------- */
  /* The four points below are calibrated to the orange pole-joints already
     drawn in assets/dragon.png (as % of the image's width/height), so the
     glow markers land exactly on them regardless of how large the image
     is rendered. */

  var MARKER_POINTS = [
    { x: 21.83, y: 34.5 },
    { x: 36.08, y: 57.5 },
    { x: 57.17, y: 32.63 },
    { x: 83.58, y: 55.5 }
  ];

  function dragonHero(litCount, fullyLit) {
    var total = MARKER_POINTS.length;
    var progress = total > 0 ? litCount / total : 0;
    var grayscale = Math.round(40 - progress * 40);
    var brightness = (0.85 + progress * 0.2).toFixed(2);
    var saturate = Math.round(70 + progress * 60);
    var filterStyle = "grayscale(" + grayscale + "%) brightness(" + brightness + ") saturate(" + saturate + "%)";

    var markersHtml = "";
    for (var i = 0; i < MARKER_POINTS.length; i++) {
      var lit = i < litCount;
      var p = MARKER_POINTS[i];
      markersHtml +=
        '<span class="dragon-marker' + (lit ? " is-lit" : "") + '" style="left:' +
        p.x + "%; top:" + p.y + '%;"></span>';
    }

    var ariaLabel = t("dragonAriaLabel", { lit: litCount, total: total });

    return (
      '<div class="dragon-wrap' + (fullyLit ? " is-fully-lit" : "") + '">' +
      '<img class="dragon-image" src="assets/dragon.png" alt="' +
      escapeHtml(ariaLabel) + '" style="filter:' + filterStyle + ';" />' +
      markersHtml +
      "</div>"
    );
  }

  /* ---------------- screens ---------------- */

  function renderNickname(note, onDone) {
    render(
      '<div class="screen screen-nickname">' +
        '<div class="hero hero-small">' + dragonHero(0, false) + "</div>" +
        '<h1 class="title-zh">' + escapeHtml(GAME_CONFIG.titleZh) + "</h1>" +
        '<p class="subtitle">' + escapeHtml(pick(GAME_CONFIG.subtitle)) + "</p>" +
        '<div class="card">' +
          '<p class="blurb">' + escapeHtml(t("nicknameBlurb")) + "</p>" +
          (note ? '<p class="blurb blurb-highlight">' + escapeHtml(note) + "</p>" : "") +
          '<label class="field-label" for="nicknameInput">' + escapeHtml(t("nicknameLabel")) + "</label>" +
          '<input class="text-input" id="nicknameInput" type="text" maxlength="20" placeholder="' +
          escapeHtml(t("nicknamePlaceholder")) + '" autocomplete="off" />' +
          '<button class="btn btn-primary" id="startBtn" type="button" disabled>' + escapeHtml(t("beginBtn")) + "</button>" +
        "</div>" +
      "</div>"
    );

    var input = document.getElementById("nicknameInput");
    var btn = document.getElementById("startBtn");

    function submit() {
      var name = input.value.trim().slice(0, 20);
      if (!name) return;
      onDone(name);
    }

    input.addEventListener("input", function () {
      btn.disabled = input.value.trim().length === 0;
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && input.value.trim().length > 0) submit();
    });
    btn.addEventListener("click", submit);
    input.focus();
  }

  function renderQuestion(state, checkpoint) {
    var optionList = shuffle(pick(checkpoint.options));
    var correctText = pick(checkpoint.options)[checkpoint.correctIndex];
    var questionNumber = state.completed.length + 1;

    render(
      '<div class="screen screen-question">' +
        '<p class="topbar-badge">' + escapeHtml(t("checkpointBadge", { n: questionNumber })) + "</p>" +
        '<div class="card">' +
          '<p class="lead-text">' + escapeHtml(t("leadText")) + "</p>" +
          '<h2 class="question-text">' + escapeHtml(pick(checkpoint.question)) + "</h2>" +
          '<div class="answers" id="answers"></div>' +
          '<p class="feedback" id="feedback" aria-live="polite"></p>' +
        "</div>" +
      "</div>"
    );

    var answersEl = document.getElementById("answers");
    var feedbackEl = document.getElementById("feedback");

    optionList.forEach(function (optionText) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-answer";
      btn.textContent = optionText;
      btn.addEventListener("click", function () {
        var isCorrect = optionText === correctText;
        if (isCorrect) {
          Array.prototype.forEach.call(answersEl.children, function (b) {
            b.disabled = true;
          });
          btn.classList.add("is-correct");
          feedbackEl.textContent = "";
          recordAnswer(state, checkpoint.id, true);
          setTimeout(function () {
            renderSuccess(state, checkpoint);
          }, 550);
        } else {
          btn.classList.add("is-wrong");
          feedbackEl.textContent = t("notQuite");
          recordAnswer(state, checkpoint.id, false);
          setTimeout(function () {
            btn.classList.remove("is-wrong");
          }, 400);
        }
      });
      answersEl.appendChild(btn);
    });
  }

  function renderSuccess(state, justCompleted) {
    if (state.completed.length === CHECKPOINTS.length) {
      renderComplete(state);
      return;
    }

    render(
      '<div class="screen screen-success">' +
        '<div class="hero">' + dragonHero(state.completed.length, false) + "</div>" +
        '<div class="card card-success">' +
          "<h2>" + escapeHtml(t("youFound", { icon: justCompleted.icon, name: pick(justCompleted.name) })) + "</h2>" +
          '<div class="clue-box">' +
            '<p class="clue-label">' + escapeHtml(t("nextClueLabel")) + "</p>" +
            '<p class="clue-text">' +
            escapeHtml(state.pendingClue ? pick(state.pendingClue.text) : "") +
            "</p>" +
          "</div>" +
          '<button class="btn btn-primary" id="continueBtn" type="button">' + escapeHtml(t("continueBtn")) + "</button>" +
        "</div>" +
      "</div>"
    );

    document.getElementById("continueBtn").addEventListener("click", goHome);
  }

  function renderAlreadyDone(checkpoint) {
    render(
      '<div class="screen screen-info">' +
        '<div class="card">' +
          "<h2>" + escapeHtml(t("alreadyFound", { icon: checkpoint.icon, name: pick(checkpoint.name) })) + "</h2>" +
          '<p class="blurb">' + escapeHtml(t("keepExploring")) + "</p>" +
          '<button class="btn btn-primary" id="backBtn" type="button">' + escapeHtml(t("backBtn")) + "</button>" +
        "</div>" +
      "</div>"
    );
    document.getElementById("backBtn").addEventListener("click", goHome);
  }

  function renderInvalid() {
    render(
      '<div class="screen screen-info">' +
        '<div class="card">' +
          "<h2>" + escapeHtml(t("invalidTitle")) + "</h2>" +
          '<p class="blurb">' + escapeHtml(t("invalidBody")) + "</p>" +
          '<button class="btn btn-primary" id="backBtn" type="button">' + escapeHtml(t("backBtn")) + "</button>" +
        "</div>" +
      "</div>"
    );
    document.getElementById("backBtn").addEventListener("click", goHome);
  }

  function renderComplete(state) {
    var stamps = "";
    for (var i = 0; i < CHECKPOINTS.length; i++) stamps += '<span class="stamp">✔</span>';

    render(
      '<div class="screen screen-complete">' +
        '<div class="hero">' + dragonHero(CHECKPOINTS.length, true) + "</div>" +
        '<div class="card card-complete">' +
          "<h2>" + escapeHtml(t("journeyComplete", { name: state.nickname })) + "</h2>" +
          '<div class="stamp-row">' + stamps + "</div>" +
          '<p class="complete-message">' + escapeHtml(pick(GAME_CONFIG.completionMessage)) + "</p>" +
          '<p class="hint-text">' + escapeHtml(t("keepScreenOpen")) + "</p>" +
          '<button class="btn btn-secondary" id="playAgainBtn" type="button">' + escapeHtml(t("playAgainBtn")) + "</button>" +
        "</div>" +
      "</div>"
    );

    document.getElementById("playAgainBtn").addEventListener("click", function () {
      var ok = window.confirm(t("playAgainConfirm"));
      if (ok) {
        resetForPlayAgain();
        goHome();
      }
    });
  }

  function renderMap(state) {
    var doneCount = state.completed.length;
    var trailHtml = "";

    for (var i = 0; i < CHECKPOINTS.length; i++) {
      var cp = CHECKPOINTS[i];
      var stateClass = "mystery";
      var mark = "?";
      var label = "?";
      if (state.completed.indexOf(cp.id) !== -1) {
        stateClass = "done";
        mark = cp.icon;
        label = pick(cp.name);
      } else if (state.pendingClue && state.pendingClue.checkpointId === cp.id) {
        stateClass = "clue";
        mark = "🏮";
        label = t("clueGivenLabel");
      }
      trailHtml +=
        '<div class="trail-node trail-node--' + stateClass + '">' +
          '<div class="trail-dot">' + mark + "</div>" +
          '<p class="trail-label">' + escapeHtml(label) + "</p>" +
        "</div>";
    }

    var clueSectionHtml = "";
    if (state.pendingClue) {
      clueSectionHtml =
        '<div class="card card-clue">' +
          '<p class="clue-label">' + escapeHtml(t("nextClueLabel")) + "</p>" +
          '<p class="clue-text">' + escapeHtml(pick(state.pendingClue.text)) + "</p>" +
          '<p class="clue-hint">' + escapeHtml(t("findSpot")) + "</p>" +
        "</div>";
    } else if (doneCount === 0) {
      clueSectionHtml =
        '<div class="card card-clue">' +
          '<p class="clue-label">' + escapeHtml(t("beginJourneyLabel")) + "</p>" +
          '<p class="clue-text">' + escapeHtml(t("lookForQr")) + "</p>" +
        "</div>";
    }

    render(
      '<div class="screen screen-map">' +
        '<div class="hero">' + dragonHero(doneCount, false) + "</div>" +
        '<p class="progress-label">' + escapeHtml(t("checkpointsFound", { done: doneCount, total: CHECKPOINTS.length })) + "</p>" +
        '<div class="trail">' + trailHtml + "</div>" +
        clueSectionHtml +
        '<button class="btn-link" id="resetBtn" type="button">' + escapeHtml(t("restartLink")) + "</button>" +
      "</div>"
    );

    document.getElementById("resetBtn").addEventListener("click", function () {
      var ok = window.confirm(t("restartConfirm"));
      if (ok) {
        localStorage.removeItem(STORAGE_KEY);
        goHome();
      }
    });
  }

  /* ---------------- routing ---------------- */

  function route() {
    var state = loadState();
    currentLang = state.lang === "zh" ? "zh" : "en";
    var checkpointId = getCheckpointParam();

    if (!state.nickname) {
      var note = checkpointId ? t("checkpointFoundNote") : "";
      renderNickname(note, function (name) {
        state.nickname = name;
        saveState(state);
        route();
      });
      return;
    }

    if (checkpointId) {
      var checkpoint = findCheckpoint(checkpointId);
      if (!checkpoint) {
        renderInvalid();
        return;
      }
      if (state.completed.length === CHECKPOINTS.length) {
        renderComplete(state);
        return;
      }
      if (state.completed.indexOf(checkpointId) !== -1) {
        renderAlreadyDone(checkpoint);
        return;
      }
      renderQuestion(state, checkpoint);
      return;
    }

    if (state.completed.length === CHECKPOINTS.length) {
      renderComplete(state);
    } else {
      renderMap(state);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderStars();
    route();
  });

  // Exposed for debugging/testing in a console. The app itself only calls
  // route() via the DOMContentLoaded listener above.
  window.FireDragonHunt = { route: route };
})();
