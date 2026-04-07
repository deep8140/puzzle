const pScoreElement = document.getElementById('player-score');
const cScoreElement = document.getElementById('computer-score');
const playerHand = document.getElementById('player-hand');
const computerHand = document.getElementById('computer-hand');
const resultText = document.getElementById('result-text');
const choiceBtns = document.querySelectorAll('.choice-btn');

let pScore = 0;
let cScore = 0;

const emojis = {
    'rock': '✊',
    'paper': '✋',
    'scissors': '✌️'
};

const handTransforms = {
    'player': {
        'rock': 'rotate(90deg)',
        'paper': 'rotate(90deg)',
        'scissors': 'rotate(90deg)' // Adjust depending on exact emoji rendering
    },
    'computer': {
        'rock': 'rotate(-90deg) scaleX(-1)',
        'paper': 'rotate(-90deg) scaleX(-1)',
        'scissors': 'rotate(-90deg) scaleX(-1)'
    }
}

choiceBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const playerChoice = this.getAttribute('data-choice');
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * 3)];

        playRound(playerChoice, computerChoice);
    });
});

function playRound(playerChoice, computerChoice) {
    // Disable buttons during animation
    choiceBtns.forEach(btn => btn.disabled = true);
    
    // Reset hands to rock for animation
    playerHand.textContent = emojis['rock'];
    computerHand.textContent = emojis['rock'];
    
    playerHand.style.transform = handTransforms['player']['rock'];
    computerHand.style.transform = handTransforms['computer']['rock'];

    resultText.textContent = '...';
    
    // Add animation classes
    playerHand.classList.add('shaking-player');
    computerHand.classList.add('shaking-computer');

    // Wait for animation to finish
    setTimeout(() => {
        playerHand.classList.remove('shaking-player');
        computerHand.classList.remove('shaking-computer');

        // Update hands
        playerHand.textContent = emojis[playerChoice];
        computerHand.textContent = emojis[computerChoice];

        // Specific adjustments for better visuals if needed, but simple is ok
        playerHand.style.transform = 'none';
        computerHand.style.transform = 'scaleX(-1)'; // computer faces left

        compareHands(playerChoice, computerChoice);
        
        // Re-enable buttons
        choiceBtns.forEach(btn => btn.disabled = false);
    }, 1500); // Animation is 1.5s
}

function compareHands(player, computer) {
    if (player === computer) {
        resultText.textContent = "It's a Tie!";
        return;
    }

    if (player === 'rock') {
        if (computer === 'scissors') {
            resultText.textContent = 'You Win!';
            pScore++;
        } else {
            resultText.textContent = 'Computer Wins!';
            cScore++;
        }
    }

    if (player === 'paper') {
        if (computer === 'rock') {
            resultText.textContent = 'You Win!';
            pScore++;
        } else {
            resultText.textContent = 'Computer Wins!';
            cScore++;
        }
    }

    if (player === 'scissors') {
        if (computer === 'paper') {
            resultText.textContent = 'You Win!';
            pScore++;
        } else {
            resultText.textContent = 'Computer Wins!';
            cScore++;
        }
    }

    updateScore();
}

function updateScore() {
    pScoreElement.textContent = pScore;
    cScoreElement.textContent = cScore;
}
