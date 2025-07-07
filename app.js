// app.js - Sudoku WebApp

const screens = {
  start: renderStartScreen,
  mode: renderModeScreen,
  game: renderGameScreen,
  gameover: renderGameOverScreen,
  score: renderScoreScreen,
  credits: renderCreditsScreen
};

let state = {
  screen: 'start',
  mode: null,
  sudoku: null,
  solution: null,
  originalPuzzle: null,
  time: 0,
  score: 0,
  selected: { row: null, col: null },
  errors: 0,
  maxErrors: 3,
  hints: 0,
  maxHints: 3,
  startTime: null,
  isComplete: false,
  gameTimer: null
};

function navigate(screen, extra = {}) {
  state = { ...state, ...extra, screen };
  document.getElementById('app').innerHTML = '';
  screens[screen]();
}

function renderStartScreen() {
  const div = document.createElement('div');
  div.className = 'screen';
  div.innerHTML = `
    <div class="logo-sudoku">SUDOKU</div>
    <div class="welcome">¡Bienvenido/a!<br>Disfruta el clásico Sudoku con una experiencia moderna y colorida.<br><span style="font-size:0.95em;color:var(--secondary);opacity:0.8;">Selecciona "Jugar" para comenzar.</span></div>
    <button class="btn btn-play" onclick="navigate('mode')">Jugar</button>
    <button class="btn btn-score" onclick="navigate('score')">Puntajes</button>
    <button class="btn btn-credits" onclick="navigate('credits')">Créditos</button>
  `;
  document.getElementById('app').appendChild(div);
}

function renderModeScreen() {
  const div = document.createElement('div');
  div.className = 'screen';
div.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center;">
        <h2 style="animation: fadeInDown 0.5s; text-align: center;">Selecciona Dificultad</h2>
        <div style="margin: 1rem 0; font-size: 0.9rem; color: var(--secondary); text-align: center;">
            <div>🟢 Fácil: 35 números ocultos</div>
            <div>🟡 Medio: 45 números ocultos</div>
            <div>🔴 Avanzado: 55 números ocultos</div>
        </div>
        <button class="btn btn-play" onclick="startGame('facil')" style="animation: fadeInUp 0.6s; width: 100%;">🟢 Fácil</button>
        <button class="btn btn-score" onclick="startGame('medio')" style="animation: fadeInUp 0.8s; width: 100%;">🟡 Medio</button>
        <button class="btn btn-credits" onclick="startGame('avanzado')" style="animation: fadeInUp 1s; width: 100%;">🔴 Avanzado</button>
        <button class="btn" onclick="navigate('start')" style="animation: fadeInUp 1.2s; background: var(--secondary); width: 100%;">🏠 Volver</button>
    </div>
`;
  document.getElementById('app').appendChild(div);
}

function renderGameScreen() {
  const div = document.createElement('div');
  div.className = 'screen';
  div.innerHTML = `
    <h2 style="animation: fadeInDown 0.7s cubic-bezier(.4,2,.6,1)">Sudoku (${state.mode})</h2>
    <div style="display: flex; justify-content: space-between; width: 100%; max-width: 360px; margin: 0.5rem 0;">
      <div style="font-size: 0.9rem; color: var(--secondary);">⏱️ <span id="timer">00:00</span></div>
      <div style="font-size: 0.9rem; color: var(--secondary);">🎯 <span id="score-display">${state.score}</span></div>
    </div>
    <canvas id="sudoku-canvas" class="sudoku-canvas"></canvas>
    <div id="game-controls" class="game-controls"></div>
    <div style="display: flex; justify-content: space-between; width: 100%; max-width: 360px; margin: 0.5rem 0;">
      <div id="error-counter" style="animation: fadeInUp 1s; color: var(--accent);">❌ <span id="error-count">${state.errors}</span>/${state.maxErrors}</div>
      <div id="hint-counter" style="animation: fadeInUp 1s; color: var(--highlight);">💡 <span id="hint-count">${state.hints}</span>/${state.maxHints}</div>
    </div>
    <div style="display: flex; gap: 0.8rem; margin: 1rem auto 0 auto; justify-content: center; max-width: 360px; width: 100%;">
      <button onclick="getHint()" style="animation: fadeInUp 1.1s; background: var(--button-play); font-size: 0.75rem; padding: 0.7rem 1.2rem; flex: 1; min-width: 0;">💡 Pista</button>
      <button onclick="resetGame()" style="animation: fadeInUp 1.1s; background: var(--button-score); font-size: 0.60rem; padding: 0.7rem 1.2rem; flex: 1; min-width: 0;">🔄 Reiniciar</button>
      <button onclick="navigate('start')" style="animation: fadeInUp 1.2s; background: var(--secondary); font-size: 0.75rem; padding: 0.7rem 1.2rem; flex: 1; min-width: 0;">🏠 Salir</button>
    </div>
  `;
  document.getElementById('app').appendChild(div);
  renderSudokuCanvas();
  renderNumberControls();
  startGameTimer();
}

function renderGameOverScreen() {
  const div = document.createElement('div');
  div.className = 'screen';
  const timeStr = formatTime(state.time);
  const isWin = state.isComplete;
  div.innerHTML = `
    <h2 style="animation: fadeInDown 0.5s">${isWin ? '🎉 ¡Felicitaciones!' : '💥 Game Over'}</h2>
    <div style="text-align: center; margin: 1rem 0;">
      ${isWin ? '<div style="font-size: 1.2rem; color: var(--highlight);">¡Completaste el Sudoku!</div>' : '<div style="font-size: 1.2rem; color: var(--accent);">Se acabaron los intentos</div>'}
      <div style="margin: 1rem 0; font-size: 1rem;">
        <div>⏱️ Tiempo: <strong>${timeStr}</strong></div>
        <div>🎯 Puntaje: <strong>${state.score}</strong></div>
        <div>❌ Errores: <strong>${state.errors}</strong></div>
        <div>💡 Pistas usadas: <strong>${state.hints}</strong></div>
      </div>
    </div>
    <button class="btn btn-play" onclick="navigate('mode')" style="animation: fadeInUp 0.6s">🎮 Jugar de Nuevo</button>
    <button class="btn btn-score" onclick="navigate('score')" style="animation: fadeInUp 0.8s">🏆 Ver Puntajes</button>
    <button class="btn" onclick="navigate('start')" style="animation: fadeInUp 1s; background: var(--secondary);">🏠 Inicio</button>
  `;
  document.getElementById('app').appendChild(div);
}

function renderScoreScreen() {
  const div = document.createElement('div');
  div.className = 'screen';
  const scores = JSON.parse(localStorage.getItem('sudoku-scores') || '[]')
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  div.innerHTML = `
    <h2 style="animation: fadeInDown 0.5s">🏆 Mejores Puntajes</h2>
    <div style="width: 100%; max-width: 360px; margin: 1rem 0;">
      ${scores.length > 0 ? 
        scores.map((s, i) => `
          <div style="display: flex; justify-content: space-between; padding: 0.5rem; margin: 0.3rem 0; background: rgba(7,158,166,0.1); border-radius: 0.5rem; animation: fadeInUp ${0.6 + i*0.1}s;">
            <span>${i+1}. ${s.mode} - ${formatTime(s.time || 0)}</span>
            <span style="color: var(--accent); font-weight: bold;">${s.score} pts</span>
          </div>
        `).join('') : 
        '<div style="text-align: center; color: var(--secondary); margin: 2rem 0;">No hay puntajes aún<br>¡Juega tu primera partida!</div>'
      }
    </div>
    <button class="btn btn-play" onclick="navigate('mode')" style="animation: fadeInUp 0.8s">🎮 Jugar</button>
    <button class="btn" onclick="clearScores()" style="animation: fadeInUp 1s; background: var(--highlight);">🗑️ Limpiar</button>
    <button class="btn" onclick="navigate('start')" style="animation: fadeInUp 1.2s; background: var(--secondary);">🏠 Volver</button>
  `;
  document.getElementById('app').appendChild(div);
}

function renderCreditsScreen() {
  const div = document.createElement('div');
  div.className = 'screen';
  div.innerHTML = `
    <h2 style="animation: fadeInDown 0.5s">💫 Créditos</h2>
    <div style="text-align: center; margin: 1.5rem 0; line-height: 1.6;">
      <div style="font-size: 1.1rem; margin-bottom: 1rem;">🎮 Sudoku WebApp</div>
      <div style="color: var(--secondary); margin-bottom: 0.5rem;">Desarrollado con ❤️ por</div>
      <div style="color: var(--accent); font-weight: bold;">arturyLab 🧪</div>
      <div style="color: var(--secondary); margin-top: 1rem; font-size: 0.9rem;">
        Tecnologías utilizadas:<br>
        🌐 HTML5 Canvas<br>
        🎨 CSS3 Animations<br>
        ⚡ Vanilla JavaScript<br>
        📱 Responsive Design
      </div>
      <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--secondary); opacity: 0.7;">
        © ${new Date().getFullYear()} - Versión 1.0
      </div>
    </div>
    <button class="btn btn-play" onclick="navigate('mode')" style="animation: fadeInUp 0.8s">🎮 Jugar</button>
    <button class="btn" onclick="navigate('start')" style="animation: fadeInUp 1s; background: var(--secondary);">🏠 Volver</button>
  `;
  document.getElementById('app').appendChild(div);
}

// --- Lógica de Sudoku y Canvas ---
function startGame(mode) {
  // Generar tablero y solución
  const { puzzle, solution } = generateSudoku(mode);
  state.sudoku = puzzle;
  state.solution = solution;
  state.originalPuzzle = puzzle.map(row => row.slice());
  state.mode = mode;
  state.score = 0;
  state.selected = { row: null, col: null };
  state.errors = 0;
  state.hints = 0;
  state.time = 0;
  state.startTime = Date.now();
  state.isComplete = false;
  navigate('game');
}

function renderSudokuCanvas() {
  const canvas = document.getElementById('sudoku-canvas');
  const size = Math.min(canvas.parentElement.offsetWidth, 360);
  canvas.width = size;
  canvas.height = size;
  drawSudoku(canvas, state.sudoku, state.selected);
  // Interacción: seleccionar celda
  canvas.onclick = function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const N = 9;
    const cell = canvas.width / N;
    const col = Math.floor(x / cell);
    const row = Math.floor(y / cell);
    // Solo seleccionables las celdas vacías
    if (state.sudoku[row][col] === 0) {
      state.selected = { row, col };
      drawSudoku(canvas, state.sudoku, state.selected);
    }
  };
  // Teclado
  window.onkeydown = function(e) {
    if (!state.selected || state.screen !== 'game') return;
    if (e.key >= '1' && e.key <= '9') {
      handleNumberInput(parseInt(e.key));
    }
  };
}

function drawSudoku(canvas, board, selected) {
  const ctx = canvas.getContext('2d');
  const N = 9;
  const cell = canvas.width / N;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Fondo con gradiente arcade
  const t = Date.now() * 0.0002;
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, `#e3e0b3`);
  grad.addColorStop(1, `#079ea6`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Sombra sutil
  ctx.save();
  ctx.shadowColor = '#1e0c42';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  // Celdas
  ctx.font = `${cell * 0.55}px 'Press Start 2P', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      // Selección
      if (selected && selected.row === r && selected.col === c) {
        ctx.save();
        ctx.globalAlpha = 0.8 + 0.15 * Math.sin(Date.now() * 0.008);
        ctx.fillStyle = '#f0077b';
        ctx.fillRect(c * cell, r * cell, cell, cell);
        ctx.restore();
      }
      // Fondo de celda tipo "pixel"
      ctx.save();
      ctx.globalAlpha = 0.13;
      ctx.fillStyle = (r + c) % 2 === 0 ? '#1e0c42' : '#079ea6';
      ctx.fillRect(c * cell, r * cell, cell, cell);
      ctx.restore();
      if (board[r][c] !== 0) {
        ctx.save();
        ctx.shadowColor = '#f5be58';
        ctx.shadowBlur = 2.5;
        ctx.fillStyle = '#1e0c42';
        ctx.fillText(board[r][c], c * cell + cell/2, r * cell + cell/2 + cell*0.04);
        ctx.restore();
      }
    }
  }
  ctx.restore();
  // Líneas tipo "pixel art"
  ctx.strokeStyle = '#1e0c42';
  for (let i = 0; i <= N; i++) {
    ctx.lineWidth = (i % 3 === 0) ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(canvas.width, i * cell);
    ctx.stroke();
  }
  // Animación continua
  if (state.screen === 'game') requestAnimationFrame(() => drawSudoku(canvas, board, selected));
}

// Renderiza controles numéricos en pantalla
function renderNumberControls() {
  const controls = document.getElementById('game-controls');
  controls.innerHTML = '';
  controls.style.display = 'grid';
  controls.style.gridTemplateColumns = 'repeat(3, 1fr)';
  controls.style.gap = '0.9rem';
  controls.style.margin = '1.5rem 0 1rem 0';
  controls.style.maxWidth = '360px';
  controls.style.width = '100%';

  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.textContent = n;
    btn.onclick = () => handleNumberInput(n);
    btn.className = 'btn number-btn';

    // Colores rotativos
    const colors = ['var(--button-play)', 'var(--button-score)', 'var(--button-credits)'];
    btn.style.background = colors[(n-1) % 3];
    btn.style.color = 'var(--button-text)';
    btn.style.fontFamily = "'Press Start 2P', monospace";
    btn.style.fontSize = '1.2rem';
    btn.style.letterSpacing = '0.02em';
    btn.style.boxShadow = '0 2px 10px rgba(30,12,66,0.16)';
    btn.style.borderRadius = '0.6rem';
    btn.style.padding = '1.1rem 0';
    btn.style.width = '100%';
    btn.style.margin = '0';
    btn.style.border = '2px solid transparent';
    btn.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';

    // Eventos mejorados
    btn.onmousedown = () => {
      btn.style.transform = 'scale(0.95) translateY(2px)';
      btn.style.boxShadow = '0 1px 5px rgba(30,12,66,0.25)';
    };

    btn.onmouseup = btn.onmouseleave = () => {
      btn.style.transform = '';
      btn.style.boxShadow = '0 2px 10px rgba(30,12,66,0.16)';
      btn.style.border = '2px solid transparent';
    };

    btn.onmouseover = () => {
      btn.style.background = 'var(--button-hover)';
      btn.style.color = 'var(--primary)';
      btn.style.border = '2px solid rgb(30, 12, 66)';
      btn.style.transform = 'translateY(-1px)';
      btn.style.boxShadow = '0 4px 15px rgba(240,7,123,0.2)';
    };

    btn.onmouseout = () => {
      btn.style.background = colors[(n-1) % 3];
      btn.style.color = 'var(--button-text)';
      btn.style.border = '2px solid transparent';
      btn.style.transform = '';
      btn.style.boxShadow = '0 2px 10px rgba(30,12,66,0.16)';
    };

    controls.appendChild(btn);
  }
}

// --- Funciones auxiliares del juego ---
function startGameTimer() {
  if (state.gameTimer) clearInterval(state.gameTimer);
  state.gameTimer = setInterval(() => {
    if (state.screen === 'game' && !state.isComplete) {
      state.time = Math.floor((Date.now() - state.startTime) / 1000);
      updateTimerDisplay();
    }
  }, 1000);
}

function stopGameTimer() {
  if (state.gameTimer) {
    clearInterval(state.gameTimer);
    state.gameTimer = null;
  }
}

function updateTimerDisplay() {
  const timer = document.getElementById('timer');
  if (timer) timer.textContent = formatTime(state.time);
}

function updateScoreDisplay() {
  const score = document.getElementById('score-display');
  if (score) score.textContent = state.score;
}

function updateErrorDisplay() {
  const errors = document.getElementById('error-count');
  if (errors) errors.textContent = state.errors;
}

function updateHintDisplay() {
  const hints = document.getElementById('hint-count');
  if (hints) hints.textContent = state.hints;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getHint() {
  if (state.hints >= state.maxHints || state.isComplete) return;
  
  // Encontrar celda vacía aleatoria
  const emptyCells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (state.sudoku[r][c] === 0) {
        emptyCells.push({ row: r, col: c });
      }
    }
  }
  
  if (emptyCells.length === 0) return;
  
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  state.sudoku[randomCell.row][randomCell.col] = state.solution[randomCell.row][randomCell.col];
  state.hints++;
  state.score -= 15; // Penalizar por usar pista
  
  updateHintDisplay();
  updateScoreDisplay();
  flashCell(randomCell.row, randomCell.col, true);
  checkGameComplete();
}

function resetGame() {
  state.sudoku = state.originalPuzzle.map(row => row.slice());
  state.selected = { row: null, col: null };
  state.errors = 0;
  state.hints = 0;
  state.score = 0;
  state.time = 0;
  state.startTime = Date.now();
  state.isComplete = false;
  
  updateErrorDisplay();
  updateHintDisplay();
  updateScoreDisplay();
  updateTimerDisplay();
  renderSudokuCanvas();
}

function celebrateWin() {
  // Animación de victoria
  const canvas = document.getElementById('sudoku-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  
  // Crear partículas
  for (let i = 0; i < 50; i++) {
    const colors = ['#079ea6', '#f0077b', '#f5be58', '#e3e0b3'];
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 2,
      life: 1
    });
  }
  
  function animateParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.size *= 0.98;
    });
    
    ctx.restore();
    particles = particles.filter(p => p.life > 0);
    
    if (particles.length > 0) {
      requestAnimationFrame(animateParticles);
    }
  }
  
  animateParticles();
}

function clearScores() {
  if (confirm('¿Estás seguro de que quieres limpiar todos los puntajes?')) {
    localStorage.removeItem('sudoku-scores');
    navigate('score');
  }
}

// Mejorar la función de animación de celda

function flashCell(row, col, success) {
  const canvas = document.getElementById('sudoku-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const N = 9;
  const cell = canvas.width / N;
  let alpha = 0.8;
  let scale = 1;
  let color = success ? '#079ea6' : '#f0077b';
  function animate() {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const centerX = col * cell + cell / 2;
    const centerY = row * cell + cell / 2;
    const size = cell * scale;
    ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
    ctx.restore();
    alpha -= 0.05;
    scale += success ? 0.02 : -0.02;
    if (alpha > 0) {
      requestAnimationFrame(animate);
    } else {
      renderSudokuCanvas();
    }
  }
  animate();
}

// --- Manejo de entrada numérica ---
function handleNumberInput(num) {
  if (state.screen !== 'game' || state.isComplete) return;
  const { row, col } = state.selected || {};
  if (row == null || col == null) return;
  // No permitir modificar celdas originales
  if (state.originalPuzzle[row][col] !== 0) return;
  // Si ya está correcto, no hacer nada
  if (state.sudoku[row][col] === state.solution[row][col]) return;
  // Validar número
  if (num === state.solution[row][col]) {
    state.sudoku[row][col] = num;
    state.score += 25;
    flashCell(row, col, true);
  } else {
    state.errors++;
    state.score -= 10;
    flashCell(row, col, false);
    if (state.errors >= state.maxErrors) {
      endGame(false);
      return;
    }
  }
  updateScoreDisplay();
  updateErrorDisplay();
  // Deseleccionar celda tras jugada
  state.selected = { row: null, col: null };
  checkGameComplete();
}

function checkGameComplete() {
  // Verifica si el tablero está completo y correcto
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (state.sudoku[r][c] !== state.solution[r][c]) return;
    }
  }
  // ¡Victoria!
  state.isComplete = true;
  stopGameTimer();
  state.score += Math.max(0, 200 - state.time); // Bonus por tiempo
  saveScore();
  celebrateWin();
  setTimeout(() => navigate('gameover', { isComplete: true }), 1200);
}

function endGame(win) {
  state.isComplete = true;
  stopGameTimer();
  if (win) {
    state.score += Math.max(0, 200 - state.time);
    saveScore();
    celebrateWin();
  }
  setTimeout(() => navigate('gameover', { isComplete: win }), 900);
}

function saveScore() {
  const scores = JSON.parse(localStorage.getItem('sudoku-scores') || '[]');
  scores.push({
    mode: state.mode,
    score: state.score,
    time: state.time,
    errors: state.errors,
    hints: state.hints,
    date: Date.now()
  });
  localStorage.setItem('sudoku-scores', JSON.stringify(scores));
}

// --- Generador mejorado de Sudoku ---
function generateSudoku(mode) {
  // Crear tablero vacío
  const board = Array(9).fill().map(() => Array(9).fill(0));
  
  // Llenar diagonal de 3x3 primero
  fillDiagonal(board);
  
  // Resolver el resto
  solveSudoku(board);
  
  const solution = board.map(row => row.slice());
  
  // Crear puzzle removiendo números
  const holes = mode === 'facil' ? 35 : mode === 'medio' ? 45 : 55;
  const puzzle = createPuzzle(solution, holes);
  
  return { puzzle, solution };
}

function fillDiagonal(board) {
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
}

function fillBox(board, row, col) {
  const nums = [1,2,3,4,5,6,7,8,9];
  shuffleArray(nums);
  let idx = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = nums[idx++];
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function solveSudoku(board) {
  const empty = findEmptyCell(board);
  if (!empty) return true;
  
  const [row, col] = empty;
  const nums = [1,2,3,4,5,6,7,8,9];
  shuffleArray(nums);
  
  for (let num of nums) {
    if (isValidMove(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) return true;
      board[row][col] = 0;
    }
  }
  return false;
}

function findEmptyCell(board) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) return [i, j];
    }
  }
  return null;
}

function isValidMove(board, row, col, num) {
  // Verificar fila
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }
  
  // Verificar columna
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }
  
  // Verificar cuadrado 3x3
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  
  return true;
}

function createPuzzle(solution, holes) {
  const puzzle = solution.map(row => row.slice());
  let count = 0;
  
  while (count < holes) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      count++;
    }
  }
  
  return puzzle;
}

// Inicializar
window.navigate = navigate;
window.startGame = startGame;
window.getHint = getHint;
window.resetGame = resetGame;
window.clearScores = clearScores;
window.handleNumberInput = handleNumberInput;
navigate('start');

// Animaciones CSS globales
(function addGlobalAnimations(){
  if (document.getElementById('sudoku-anim-style')) return;
  const style = document.createElement('style');
  style.id = 'sudoku-anim-style';
  style.innerHTML = `
  @keyframes fadeInDown {
    from { opacity:0; transform: translateY(-30px); }
    to { opacity:1; transform: none; }
  }
  @keyframes fadeInUp {
    from { opacity:0; transform: translateY(30px); }
    to { opacity:1; transform: none; }
  }
  `;
  document.head.appendChild(style);
})();
