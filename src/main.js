import './style.css';

// DOM Elements
const imageUpload = document.getElementById('image-upload');
const uploadText = document.getElementById('upload-text');
const difficultySlider = document.getElementById('difficulty');
const diffValDisplay = document.getElementById('diff-val');
const gridSizeDisplay = document.getElementById('grid-size');
const startBtn = document.getElementById('start-btn');
const puzzleBoardContainer = document.getElementById('puzzle-board-container');
const puzzleBoard = document.getElementById('puzzle-board');
const winScreen = document.getElementById('win-screen');
const restartBtn = document.getElementById('restart-btn');
const cameraBtn = document.getElementById('camera-btn');
const cameraModal = document.getElementById('camera-modal');
const cameraPreview = document.getElementById('camera-preview');
const snapBtn = document.getElementById('snap-btn');
const closeCameraBtn = document.getElementById('close-camera-btn');

// Game State
let imageSrc = null;
let imgWidth = 0;
let imgHeight = 0;
let cols = 3;
let rows = 3;
let pieces = [];
let pieceWidth = 0;
let pieceHeight = 0;
let selectedPiece = null;
let isAnimating = false;
let videoStream = null;

// Initialize
function init() {
  difficultySlider.addEventListener('input', handleDifficultyChange);
  imageUpload.addEventListener('change', handleImageUpload);
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', resetGame);
  
  cameraBtn.addEventListener('click', openCamera);
  closeCameraBtn.addEventListener('click', closeCamera);
  snapBtn.addEventListener('click', snapPhoto);
}

// Handlers
function handleDifficultyChange(e) {
  const val = parseInt(e.target.value);
  diffValDisplay.textContent = val;
  cols = rows = val + 2; // Level 1 -> 3x3, Level 10 -> 12x12
  gridSizeDisplay.textContent = `${cols}x${rows}`;
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    uploadText.textContent = file.name;
    const reader = new FileReader();
    reader.onload = function(event) {
      imageSrc = event.target.result;
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        imgWidth = img.width;
        imgHeight = img.height;
        startBtn.disabled = false;
      };
      img.src = imageSrc;
    };
    reader.readAsDataURL(file);
  }
}

async function openCamera() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
    cameraPreview.srcObject = videoStream;
    cameraModal.classList.remove('hidden');
  } catch (err) {
    alert("Could not access camera: " + err.message);
  }
}

function closeCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  cameraModal.classList.add('hidden');
}

function snapPhoto() {
  if (!videoStream) return;
  const canvas = document.createElement('canvas');
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  const ctx = canvas.getContext('2d');
  
  // Flip image horizontally if it is using front 'user' facing camera, which by default is mirrored
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);
  
  imageSrc = canvas.toDataURL('image/jpeg');
  uploadText.textContent = "Camera Photo";
  
  // Load dimensions
  const img = new Image();
  img.onload = () => {
    imgWidth = img.width;
    imgHeight = img.height;
    startBtn.disabled = false;
  };
  img.src = imageSrc;
  
  closeCamera();
}

function calculateBoardSize() {
  const maxAvailableWidth = Math.min(window.innerWidth - 60, 600);
  const ratio = imgHeight / imgWidth;
  let finalWidth = maxAvailableWidth;
  let finalHeight = finalWidth * ratio;
  
  // If height is too big for screen, scale down by height
  const maxAvailableHeight = window.innerHeight - 300; // Leave space for header/controls
  if (finalHeight > maxAvailableHeight && maxAvailableHeight > 200) {
    finalHeight = maxAvailableHeight;
    finalWidth = finalHeight / ratio;
  }
  
  return { width: finalWidth, height: finalHeight };
}

function startGame() {
  if (!imageSrc) return;
  
  // Clean up
  puzzleBoard.innerHTML = '';
  winScreen.classList.add('hidden');
  puzzleBoardContainer.classList.remove('hidden');
  
  const boardSize = calculateBoardSize();
  const bWidth = boardSize.width;
  const bHeight = boardSize.height;
  
  puzzleBoard.style.width = `${bWidth}px`;
  puzzleBoard.style.height = `${bHeight}px`;
  
  // Set CSS variables for background size
  puzzleBoard.style.setProperty('--board-width', `${bWidth}px`);
  puzzleBoard.style.setProperty('--board-height', `${bHeight}px`);
  
  pieceWidth = bWidth / cols;
  pieceHeight = bHeight / rows;
  
  pieces = [];
  
  // Create Pieces
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.style.width = `${pieceWidth}px`;
      piece.style.height = `${pieceHeight}px`;
      piece.style.backgroundImage = `url(${imageSrc})`;
      
      // Background position
      piece.style.backgroundPosition = `-${x * pieceWidth}px -${y * pieceHeight}px`;
      
      const pieceObj = {
        element: piece,
        correctX: x,
        correctY: y,
        currentX: x,
        currentY: y
      };
      
      piece.addEventListener('click', () => handlePieceClick(pieceObj));
      pieces.push(pieceObj);
      puzzleBoard.appendChild(piece);
    }
  }
  
  shufflePieces();
  renderPieces();
}

function shufflePieces() {
  // Simple shuffle of current positions
  let positions = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      positions.push({x, y});
    }
  }
  
  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Pre-apply positions without animation
  puzzleBoard.classList.add('no-transition');
  pieces.forEach((p, index) => {
    p.currentX = positions[index].x;
    p.currentY = positions[index].y;
    // Set explicit transform immediately to avoid animating from origin
    p.element.style.transform = `translate(${p.currentX * pieceWidth}px, ${p.currentY * pieceHeight}px)`;
  });
  
  // Force reflow and re-enable transitions
  puzzleBoard.offsetHeight; 
  puzzleBoard.classList.remove('no-transition');
}

function renderPieces() {
  pieces.forEach(p => {
    p.element.style.transform = `translate(${p.currentX * pieceWidth}px, ${p.currentY * pieceHeight}px)`;
    
    // Scale handled by CSS when selected, we have to inject it if selected
    if (p === selectedPiece) {
      // transform override handled mostly by class, but inline transform wins, so we append scale
      p.element.style.transform = `translate(${p.currentX * pieceWidth}px, ${p.currentY * pieceHeight}px) scale(1.05)`;
    }
  });
}

function handlePieceClick(pieceObj) {
  if (isAnimating) return;
  
  if (!selectedPiece) {
    // Select first piece
    selectedPiece = pieceObj;
    pieceObj.element.classList.add('selected');
    renderPieces(); // Update transform to include scale
  } else {
    if (selectedPiece === pieceObj) {
      // Deselect
      selectedPiece.element.classList.remove('selected');
      selectedPiece = null;
      renderPieces();
      return;
    }
    
    // Swap pieces
    const tempX = selectedPiece.currentX;
    const tempY = selectedPiece.currentY;
    
    selectedPiece.currentX = pieceObj.currentX;
    selectedPiece.currentY = pieceObj.currentY;
    pieceObj.currentX = tempX;
    pieceObj.currentY = tempY;
    
    selectedPiece.element.classList.remove('selected'); // remove scale
    
    const p1 = selectedPiece;
    const p2 = pieceObj;
    selectedPiece = null;
    
    // Animate swap
    isAnimating = true;
    renderPieces();
    
    setTimeout(() => {
      isAnimating = false;
      checkWin();
    }, 300); // matches CSS transition
  }
}

function checkWin() {
  const isWin = pieces.every(p => p.currentX === p.correctX && p.currentY === p.correctY);
  
  if (isWin) {
    // Hide borders
    pieces.forEach(p => {
      // p.element.style.boxShadow = 'none';
      p.element.style.border = 'none';
    });
    
    winScreen.classList.remove('hidden');
    fireConfetti();
  }
}

function resetGame() {
  winScreen.classList.add('hidden');
  puzzleBoardContainer.classList.add('hidden');
  uploadText.textContent = "Upload Image";
  imageUpload.value = "";
  imageSrc = null;
  startBtn.disabled = true;
  puzzleBoard.innerHTML = '';
  
  // Remove confetti canvas if exists
  const cc = document.getElementById('confetti-canvas');
  if (cc) cc.remove();
}

// Particle System (Confetti)
function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#6366f1', '#a855f7', '#f59e0b', '#ef4444', '#10b981'];
  
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 + 100, // explode from center bottom-ish
      r: Math.random() * 6 + 2,
      dx: Math.random() * 20 - 10,
      dy: Math.random() * -20 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncrement: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0
    });
  }
  
  let animationId;
  function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let active = false;
    
    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncrement;
      p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2 + p.dy;
      p.x += Math.sin(p.tiltAngle) * 2 + p.dx;
      p.dy += 0.5; // gravity
      
      if (p.y <= canvas.height) active = true;
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
      ctx.stroke();
    });
    
    if (!active) {
      cancelAnimationFrame(animationId);
      canvas.remove();
    }
  }
  
  animate();
}

window.addEventListener('resize', () => {
    // Optional: Resizing the puzzle mid-game is complex as piece positions change.
    // For now we lock it, or users can re-upload to regenerate.
});

// Init
init();
