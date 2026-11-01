/**
 * POKERDOJO MOBILE - APP LOGIC
 * Interfaz Mobile-First, Gamificación Duolingo, Audio sintetizado y Confeti
 */

(function () {
  'use strict';

  // ==========================================
  // ESTADO Y LOCALSTORAGE
  // ==========================================
  const STORAGE_KEY = 'pokerdojo_player_data';

  const defaultState = {
    xp: 0,
    streak: 0,
    maxStreak: 0,
    level: 1, // 1, 2, 3 o 'random'
    lessonIndices: { 1: 0, 2: 0, 3: 0 },
    soundEnabled: true,
    eyeIndex: 0,
    preflopIndex: 0,
    stats: { played: 0, won: 0 }
  };

  let state = loadState();

  function loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...defaultState, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('No se pudo cargar localStorage:', e);
    }
    return { ...defaultState };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
    updateTopBarUI();
  }

  // ==========================================
  // WEB AUDIO API SINTETIZADO (Cero dependencias)
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.15) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio no disponible
    }
  }

  function playSuccessSound() {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // Do - Mi - Sol - Do agudo
      notes.forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 0.22, 'triangle', 0.2), idx * 75);
      });
      if (navigator.vibrate) navigator.vibrate([40, 30, 60]);
    } catch (e) {}
  }

  function playErrorSound() {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      playTone(280, 0.2, 'sawtooth', 0.18);
      setTimeout(() => playTone(220, 0.35, 'sawtooth', 0.18), 120);
      if (navigator.vibrate) navigator.vibrate([100]);
    } catch (e) {}
  }

  function playCardDealSound() {
    playTone(800, 0.05, 'sine', 0.05);
  }

  // ==========================================
  // CONFETI NATIVO EN CANVAS
  // ==========================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function triggerConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    const colors = ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    confettiParticles = [];
    for (let i = 0; i < 60; i++) {
      confettiParticles.push({
        x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 160,
        y: confettiCanvas.height * 0.45,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

    function updateParticles() {
      if (!confettiCtx) return;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = false;
      for (const p of confettiParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravedad
        p.rotation += p.rotSpeed;
        p.alpha -= 0.016;

        if (p.alpha > 0) {
          alive = true;
          confettiCtx.save();
          confettiCtx.globalAlpha = Math.max(0, p.alpha);
          confettiCtx.translate(p.x, p.y);
          confettiCtx.rotate((p.rotation * Math.PI) / 180);
          confettiCtx.fillStyle = p.color;
          confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          confettiCtx.restore();
        }
      }
      if (alive) {
        confettiAnimationId = requestAnimationFrame(updateParticles);
      } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    updateParticles();
  }

  // ==========================================
  // RENDERIZADO DE CARTAS CON BARAJA 4 COLORES
  // ==========================================
  function createCardDOM(cardObj, options = {}) {
    const card = typeof cardObj === 'string' ? window.PokerEngine.createCard(cardObj) : cardObj;
    const div = document.createElement('div');
    const sizeClass = options.size === 'lg' ? 'card-lg' : (options.size === 'sm' ? 'card-sm' : '');
    div.className = `card suit-${card.suit} ${sizeClass}`.trim();
    div.dataset.cardStr = card.str;

    if (options.isWinningCard) {
      div.classList.add('highlight-winner');
    } else if (options.isLosingCard) {
      div.classList.add('highlight-loser');
    }

    div.innerHTML = `
      <div class="card-top">
        <span class="card-rank">${card.rank}</span>
        <span class="card-suit-mini">${card.symbol}</span>
      </div>
      <div class="card-center">${card.symbol}</div>
      <div class="card-bottom">
        <span class="card-rank">${card.rank}</span>
      </div>
    `;
    return div;
  }

  // ==========================================
  // ACTUALIZACIÓN DE TOP BAR
  // ==========================================
  function updateTopBarUI() {
    const streakEl = document.getElementById('streak-val');
    const xpEl = document.getElementById('xp-val');
    const soundIcon = document.getElementById('sound-icon');

    if (streakEl) streakEl.textContent = state.streak;
    if (xpEl) xpEl.textContent = state.xp;
    if (soundIcon) soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
  }

  // ==========================================
  // MODO 1: "¿QUIÉN GANA EL POZO?"
  // ==========================================
  let currentDuel = null;
  let currentDuelAnswered = false;

  function loadDuel() {
    currentDuelAnswered = false;
    resetDuelUI();

    let duelData = null;
    const currentLvl = state.level;

    if (currentLvl === 'random') {
      duelData = window.PokerEngine.generateRandomDuel();
      document.getElementById('lesson-label').textContent = '🎲 Duelo Infinito Aleatorio';
      document.getElementById('lesson-progress-fill').style.width = '100%';
    } else {
      const lessons = window.PokerEngine.GUIDED_LESSONS[currentLvl] || [];
      const idx = (state.lessonIndices[currentLvl] || 0) % lessons.length;
      duelData = lessons[idx];
      document.getElementById('lesson-label').textContent = `${duelData.title || `Lección ${idx + 1}`} (${idx + 1}/${lessons.length})`;
      const pct = Math.round(((idx + 1) / lessons.length) * 100);
      document.getElementById('lesson-progress-fill').style.width = `${pct}%`;
    }

    currentDuel = window.PokerEngine.comparePlayers(duelData.handA, duelData.handB, duelData.board);
    renderDuelBoard(currentDuel);
    playCardDealSound();
  }

  function resetDuelUI() {
    // Limpiar botones
    const btnA = document.getElementById('btn-choose-a');
    const btnB = document.getElementById('btn-choose-b');
    const btnTie = document.getElementById('btn-choose-tie');
    [btnA, btnB, btnTie].forEach(b => {
      b.className = 'btn-choice';
      b.disabled = false;
    });

    // Reset cajas jugadores
    document.getElementById('box-player-a').className = 'player-box';
    document.getElementById('box-player-b').className = 'player-box';
    document.getElementById('badge-player-a').textContent = 'En juego';
    document.getElementById('badge-player-b').textContent = 'En juego';
    document.getElementById('desc-player-a').textContent = '¿Qué mano tiene?';
    document.getElementById('desc-player-b').textContent = '¿Qué mano tiene?';
    document.getElementById('desc-player-a').className = 'player-hand-desc';
    document.getElementById('desc-player-b').className = 'player-hand-desc';

    // Ocultar feedback card
    const fb = document.getElementById('feedback-card-mode1');
    fb.className = 'feedback-card';
    fb.style.display = 'none';
  }

  function renderDuelBoard(duel, highlightWinnerCards = false) {
    const boardContainer = document.getElementById('board-cards-container');
    const handAContainer = document.getElementById('cards-player-a');
    const handBContainer = document.getElementById('cards-player-b');

    boardContainer.innerHTML = '';
    handAContainer.innerHTML = '';
    handBContainer.innerHTML = '';

    // Determinar conjunto de cartas ganadoras
    let winningCardStrings = new Set();
    if (highlightWinnerCards) {
      const bestEval = duel.winner === 'B' ? duel.evalB : duel.evalA;
      if (bestEval && bestEval.cards) {
        bestEval.cards.forEach(c => winningCardStrings.add(c.str));
      }
    }

    // Render Board
    duel.board.forEach(card => {
      const isWinner = highlightWinnerCards && winningCardStrings.has(card.str);
      const isLoser = highlightWinnerCards && !winningCardStrings.has(card.str);
      boardContainer.appendChild(createCardDOM(card, { isWinningCard: isWinner, isLosingCard: isLoser }));
    });

    // Render Mano A
    duel.handA.forEach(card => {
      const isWinner = highlightWinnerCards && duel.winner !== 'B' && winningCardStrings.has(card.str);
      const isLoser = highlightWinnerCards && (duel.winner === 'B' || !winningCardStrings.has(card.str));
      handAContainer.appendChild(createCardDOM(card, { isWinningCard: isWinner, isLosingCard: isLoser }));
    });

    // Render Mano B
    duel.handB.forEach(card => {
      const isWinner = highlightWinnerCards && duel.winner !== 'A' && winningCardStrings.has(card.str);
      const isLoser = highlightWinnerCards && (duel.winner === 'A' || !winningCardStrings.has(card.str));
      handBContainer.appendChild(createCardDOM(card, { isWinningCard: isWinner, isLosingCard: isLoser }));
    });
  }

  function handleDuelChoice(chosenOption) {
    if (currentDuelAnswered || !currentDuel) return;
    currentDuelAnswered = true;

    initAudio();

    const isCorrect = chosenOption === currentDuel.winner;
    const btnA = document.getElementById('btn-choose-a');
    const btnB = document.getElementById('btn-choose-b');
    const btnTie = document.getElementById('btn-choose-tie');
    const chosenBtn = chosenOption === 'A' ? btnA : (chosenOption === 'B' ? btnB : btnTie);
    const correctBtn = currentDuel.winner === 'A' ? btnA : (currentDuel.winner === 'B' ? btnB : btnTie);

    // Desactivar botones
    [btnA, btnB, btnTie].forEach(b => b.disabled = true);

    if (isCorrect) {
      chosenBtn.classList.add('correct');
      state.streak += 1;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;
      state.xp += 15;
      playSuccessSound();
      triggerConfetti();
    } else {
      chosenBtn.classList.add('incorrect');
      correctBtn.classList.add('correct');
      state.streak = 0;
      state.xp += 2; // Pequeño incentivo por aprender
      playErrorSound();
    }

    // Resaltar jugador ganador
    if (currentDuel.winner === 'A') {
      document.getElementById('box-player-a').classList.add('winner-box');
      document.getElementById('badge-player-a').textContent = '🏆 GANADOR';
      document.getElementById('badge-player-b').textContent = 'Derrotado';
    } else if (currentDuel.winner === 'B') {
      document.getElementById('box-player-b').classList.add('winner-box');
      document.getElementById('badge-player-b').textContent = '🏆 GANADOR';
      document.getElementById('badge-player-a').textContent = 'Derrotado';
    } else {
      document.getElementById('box-player-a').classList.add('winner-box');
      document.getElementById('box-player-b').classList.add('winner-box');
      document.getElementById('badge-player-a').textContent = '🤝 SPLIT';
      document.getElementById('badge-player-b').textContent = '🤝 SPLIT';
    }

    // Mostrar descripciones de manos de cada jugador
    const descA = document.getElementById('desc-player-a');
    const descB = document.getElementById('desc-player-b');
    descA.textContent = `${currentDuel.evalA.categoryName} (${currentDuel.evalA.rankNum})`;
    descB.textContent = `${currentDuel.evalB.categoryName} (${currentDuel.evalB.rankNum})`;
    descA.classList.add('active-desc');
    descB.classList.add('active-desc');

    // Iluminar con BORDE DORADO las 5 cartas exactas de la mano ganadora
    renderDuelBoard(currentDuel, true);

    // Tarjeta de feedback explicativa estilo Duolingo
    const edu = window.PokerEngine.getEducationalExplanation(currentDuel);
    const fbCard = document.getElementById('feedback-card-mode1');
    const fbTitle = document.getElementById('feedback-title-mode1');
    const fbBadge = document.getElementById('feedback-badge-mode1');
    const fbExp = document.getElementById('feedback-exp-mode1');

    fbCard.className = `feedback-card ${isCorrect ? 'success' : 'error'}`;
    fbCard.style.display = 'flex';
    fbTitle.className = `feedback-title ${isCorrect ? 'success-text' : 'error-text'}`;
    fbTitle.innerHTML = isCorrect ? `<span>✨ ¡Excelente!</span>` : `<span>💡 Fíjate en este detalle:</span>`;
    fbBadge.textContent = isCorrect ? '+15 XP' : '+2 XP';
    fbExp.innerHTML = `<strong>${edu.title}</strong><br>${edu.summary}`;

    saveState();
  }

  function advanceDuel() {
    if (state.level !== 'random') {
      const lessons = window.PokerEngine.GUIDED_LESSONS[state.level] || [];
      const currentIdx = state.lessonIndices[state.level] || 0;
      state.lessonIndices[state.level] = (currentIdx + 1) % lessons.length;
      saveState();
    }
    loadDuel();
  }

  // ==========================================
  // MODO 2: "ENTRENA TU OJO"
  // ==========================================
  let currentEyeQuestion = null;
  let eyeAnswered = false;

  function loadEyeQuestion() {
    eyeAnswered = false;
    const questions = window.PokerEngine.EYE_TRAINING_QUESTIONS;
    currentEyeQuestion = questions[state.eyeIndex % questions.length];

    const holeContainer = document.getElementById('eye-hole-cards');
    const boardContainer = document.getElementById('eye-board-cards');
    const optionsContainer = document.getElementById('eye-options-container');
    const fbCard = document.getElementById('feedback-card-mode2');

    fbCard.style.display = 'none';
    holeContainer.innerHTML = '';
    boardContainer.innerHTML = '';
    optionsContainer.innerHTML = '';

    // Render hole cards
    currentEyeQuestion.hole.forEach(c => holeContainer.appendChild(createCardDOM(c, { size: 'lg' })));
    // Render board cards
    currentEyeQuestion.board.forEach(c => boardContainer.appendChild(createCardDOM(c)));

    // Render 4 options
    currentEyeQuestion.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-choice';
      btn.style.padding = '12px 10px';
      btn.style.fontSize = '14px';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleEyeAnswer(opt, btn));
      optionsContainer.appendChild(btn);
    });

    playCardDealSound();
  }

  function handleEyeAnswer(selectedOpt, btnElement) {
    if (eyeAnswered) return;
    eyeAnswered = true;

    initAudio();

    const isCorrect = selectedOpt === currentEyeQuestion.correct;
    const allButtons = document.querySelectorAll('#eye-options-container .btn-choice');
    allButtons.forEach(b => {
      b.disabled = true;
      if (b.textContent === currentEyeQuestion.correct) {
        b.classList.add('correct');
      }
    });

    if (isCorrect) {
      btnElement.classList.add('correct');
      state.streak += 1;
      state.xp += 15;
      playSuccessSound();
      triggerConfetti();
    } else {
      btnElement.classList.add('incorrect');
      state.streak = 0;
      state.xp += 2;
      playErrorSound();
    }

    const fbCard = document.getElementById('feedback-card-mode2');
    const fbTitle = document.getElementById('feedback-title-mode2');
    const fbBadge = document.getElementById('feedback-badge-mode2');
    const fbExp = document.getElementById('feedback-exp-mode2');

    fbCard.className = `feedback-card ${isCorrect ? 'success' : 'error'}`;
    fbCard.style.display = 'flex';
    fbTitle.className = `feedback-title ${isCorrect ? 'success-text' : 'error-text'}`;
    fbTitle.innerHTML = isCorrect ? '<span>🎯 ¡Lectura Perfecta!</span>' : '<span>👀 Ojo al dato:</span>';
    fbBadge.textContent = isCorrect ? '+15 XP' : '+2 XP';
    fbExp.innerHTML = `<strong>${currentEyeQuestion.correct}</strong><br>${currentEyeQuestion.explanation}`;

    saveState();
  }

  function advanceEye() {
    state.eyeIndex = (state.eyeIndex + 1) % window.PokerEngine.EYE_TRAINING_QUESTIONS.length;
    saveState();
    loadEyeQuestion();
  }

  // ==========================================
  // MODO 3: "SEMÁFORO PREFLOP"
  // ==========================================
  let currentPreflopScenario = null;
  let preflopAnswered = false;

  function loadPreflopScenario() {
    preflopAnswered = false;
    const scenarios = window.PokerEngine.PREFLOP_SCENARIOS;
    currentPreflopScenario = scenarios[state.preflopIndex % scenarios.length];

    document.getElementById('preflop-pos').textContent = currentPreflopScenario.pos;
    document.getElementById('preflop-desc').textContent = currentPreflopScenario.posDesc;
    document.getElementById('preflop-stack').textContent = currentPreflopScenario.stack;

    const cardsContainer = document.getElementById('preflop-cards-container');
    cardsContainer.innerHTML = '';
    currentPreflopScenario.cards.forEach(c => cardsContainer.appendChild(createCardDOM(c, { size: 'lg' })));

    const fbCard = document.getElementById('feedback-card-mode3');
    fbCard.style.display = 'none';

    // Reset botones
    document.querySelectorAll('#preflop-traffic-buttons .traffic-btn').forEach(btn => {
      btn.style.opacity = '1';
      btn.disabled = false;
      btn.style.outline = 'none';
    });

    playCardDealSound();
  }

  function handlePreflopAction(action) {
    if (preflopAnswered) return;
    preflopAnswered = true;

    initAudio();

    const isCorrect = action === currentPreflopScenario.correct;
    const buttons = document.querySelectorAll('#preflop-traffic-buttons .traffic-btn');

    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.action === currentPreflopScenario.correct) {
        btn.style.outline = '3px solid #fbbf24';
        btn.style.transform = 'scale(1.05)';
      } else {
        btn.style.opacity = '0.4';
      }
    });

    if (isCorrect) {
      state.streak += 1;
      state.xp += 15;
      playSuccessSound();
      triggerConfetti();
    } else {
      state.streak = 0;
      state.xp += 2;
      playErrorSound();
    }

    const fbCard = document.getElementById('feedback-card-mode3');
    const fbTitle = document.getElementById('feedback-title-mode3');
    const fbBadge = document.getElementById('feedback-badge-mode3');
    const fbExp = document.getElementById('feedback-exp-mode3');

    fbCard.className = `feedback-card ${isCorrect ? 'success' : 'error'}`;
    fbCard.style.display = 'flex';
    fbTitle.className = `feedback-title ${isCorrect ? 'success-text' : 'error-text'}`;
    fbTitle.innerHTML = isCorrect ? '<span>🟢 ¡Jugada Profesional!</span>' : '<span>⚠️ Trampa Preflop:</span>';
    fbBadge.textContent = isCorrect ? '+15 XP' : '+2 XP';
    fbExp.innerHTML = `<strong>Acción Óptima: ${currentPreflopScenario.correct}</strong><br>${currentPreflopScenario.explanation}`;

    saveState();
  }

  function advancePreflop() {
    state.preflopIndex = (state.preflopIndex + 1) % window.PokerEngine.PREFLOP_SCENARIOS.length;
    saveState();
    loadPreflopScenario();
  }

  // ==========================================
  // MODO 4: "JERARQUÍA INTERACTIVA"
  // ==========================================
  function initHierarchyList() {
    const container = document.getElementById('hierarchy-list-container');
    if (!container) return;
    container.innerHTML = '';

    const list = window.PokerEngine.POKER_HANDS_HIERARCHY;
    list.forEach(item => {
      const row = document.createElement('div');
      row.className = 'hierarchy-item';

      row.innerHTML = `
        <div class="hierarchy-summary">
          <span class="rank-badge">#${item.rank}</span>
          <span class="hierarchy-name">${item.name} <small style="color: #94a3b8; font-size: 11px;">(${item.enName})</small></span>
          <span class="hierarchy-chevron">▼</span>
        </div>
        <div class="hierarchy-details">
          <div class="hierarchy-cards-preview" id="cards-preview-${item.rank}"></div>
          <div class="hierarchy-rule-box">
            <strong>Regla:</strong> ${item.rule}<br>
            <strong style="color: #38bdf8;">Probabilidad:</strong> ${item.odds}<br>
            <strong style="color: #34d399;">Memorizar:</strong> ${item.mnemonic}
          </div>
        </div>
      `;

      // Render cartas de ejemplo
      const cardsPreview = row.querySelector(`#cards-preview-${item.rank}`);
      item.cards.forEach(c => cardsPreview.appendChild(createCardDOM(c, { size: 'sm' })));

      // Toggle acordeón
      row.addEventListener('click', () => {
        row.classList.toggle('expanded');
      });

      container.appendChild(row);
    });
  }

  // ==========================================
  // CONTROLADORES DE EVENTOS
  // ==========================================
  function setupEventListeners() {
    // Modo 1 Botones
    document.getElementById('btn-choose-a').addEventListener('click', () => handleDuelChoice('A'));
    document.getElementById('btn-choose-tie').addEventListener('click', () => handleDuelChoice('tie'));
    document.getElementById('btn-choose-b').addEventListener('click', () => handleDuelChoice('B'));
    document.getElementById('btn-next-mode1').addEventListener('click', advanceDuel);

    // Nivel botones
    const levelBtns = document.querySelectorAll('.level-btn');
    levelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const lvl = btn.dataset.level;
        state.level = lvl === 'random' ? 'random' : parseInt(lvl, 10);
        saveState();
        loadDuel();
      });
    });

    // Modo 2 Botones
    document.getElementById('btn-next-mode2').addEventListener('click', advanceEye);

    // Modo 3 Botones
    document.querySelectorAll('#preflop-traffic-buttons .traffic-btn').forEach(btn => {
      btn.addEventListener('click', () => handlePreflopAction(btn.dataset.action));
    });
    document.getElementById('btn-next-mode3').addEventListener('click', advancePreflop);

    // Toggle Sonido
    document.getElementById('btn-toggle-sound').addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      saveState();
    });

    // Pestañas Inferiores
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabKey = tab.dataset.tab;
        document.querySelectorAll('.view-content').forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(`view-${tabKey}`);
        if (targetView) targetView.classList.add('active');

        if (tabKey === 'mode1' && !currentDuel) loadDuel();
        if (tabKey === 'mode2' && !currentEyeQuestion) loadEyeQuestion();
        if (tabKey === 'mode3' && !currentPreflopScenario) loadPreflopScenario();
      });
    });
  }

  // ==========================================
  // INICIALIZACIÓN GENERAL
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    updateTopBarUI();
    setupEventListeners();
    loadDuel();
    initHierarchyList();

    // Registro de Service Worker para PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(err => {
          console.log('Service Worker no registrado:', err);
        });
      });
    }
  });

})();
