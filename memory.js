const board = document.getElementById('memory-board');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');

const emojis = ['👽', '👻', '🤖', '👾', '🎃', '🤡', '👹', '👺'];
let cardsArray = [...emojis, ...emojis];
let firstCard = null;
let secondCard = null;
let hasFlippedCard = false;
let lockBoard = false;
let moves = 0;
let matches = 0;
let timer = 0;
let timerInterval = null;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

function initGame() {
  board.innerHTML = '';
  moves = 0;
  matches = 0;
  timer = 0;
  firstCard = null;
  secondCard = null;
  hasFlippedCard = false;
  lockBoard = false;
  
  movesElement.textContent = moves;
  timerElement.textContent = timer;
  
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
      timer++;
      timerElement.textContent = timer;
  }, 1000);

  shuffle(cardsArray);

  cardsArray.forEach(emoji => {
      const card = document.createElement('div');
      card.classList.add('memory-card');
      card.dataset.emoji = emoji;

      const front = document.createElement('div');
      front.classList.add('front');
      front.textContent = emoji;

      const back = document.createElement('div');
      back.classList.add('back');
      back.textContent = '?';

      card.appendChild(front);
      card.appendChild(back);

      card.addEventListener('click', flipCard);
      board.appendChild(card);
  });
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = this;
      return;
  }

  secondCard = this;
  moves++;
  movesElement.textContent = moves;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

  if (isMatch) {
      disableCards();
      matches++;
      if (matches === emojis.length) {
          clearInterval(timerInterval);
          setTimeout(() => alert(`You won in ${moves} moves and ${timer} seconds! 🎉`), 500);
      }
  } else {
      unflipCards();
  }
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      resetBoard();
  }, 1000);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

restartBtn.addEventListener('click', initGame);

// Start game on load
initGame();
