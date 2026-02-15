// Gameboard Module (IIFE - Single Instance)
const Gameboard = (() => {
    let board = ["", "", "", "", "", "", "", "", ""];

    const getBoard = () => board;

    const setCell = (index, marker) => {
        if (board[index] === "") {
            board[index] = marker;
            return true;
        }
        return false;
    };

    const resetBoard = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };

    const isFull = () => {
        return board.every(cell => cell !== "");
    };

    return {
        getBoard,
        setCell,
        resetBoard,
        isFull
    };
})();

// Player Factory
const Player = (name, marker) => {
    return { name, marker };
};

// Game Controller Module (IIFE - Single Instance)
const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameOver = false;
    let winner = null;

    const winningCombinations = [
        [0, 1, 2], // Top row
        [3, 4, 5], // Middle row
        [6, 7, 8], // Bottom row
        [0, 3, 6], // Left column
        [1, 4, 7], // Middle column
        [2, 5, 8], // Right column
        [0, 4, 8], // Diagonal top-left to bottom-right
        [2, 4, 6]  // Diagonal top-right to bottom-left
    ];

    const initializePlayers = (player1Name, player2Name) => {
        const p1Name = player1Name.trim() || "Player 1";
        const p2Name = player2Name.trim() || "Player 2";
        players = [
            Player(p1Name, "X"),
            Player(p2Name, "O")
        ];
    };

    const getCurrentPlayer = () => {
        return players[currentPlayerIndex];
    };

    const switchPlayer = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const checkWinner = () => {
        const board = Gameboard.getBoard();
        
        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] !== "" && 
                board[a] === board[b] && 
                board[a] === board[c]) {
                return {
                    winner: getCurrentPlayer(),
                    winningCells: combination
                };
            }
        }
        return null;
    };

    const playRound = (cellIndex) => {
        if (gameOver) return false;

        const currentPlayer = getCurrentPlayer();
        
        // Try to place marker
        if (Gameboard.setCell(cellIndex, currentPlayer.marker)) {
            // Check for winner
            const winResult = checkWinner();
            if (winResult) {
                gameOver = true;
                winner = winResult;
                return { 
                    success: true, 
                    gameOver: true, 
                    winner: winResult 
                };
            }

            // Check for tie
            if (Gameboard.isFull()) {
                gameOver = true;
                return { 
                    success: true, 
                    gameOver: true, 
                    tie: true 
                };
            }

            // Continue game
            switchPlayer();
            return { 
                success: true, 
                gameOver: false 
            };
        }
        
        return { success: false };
    };

    const resetGame = () => {
        Gameboard.resetBoard();
        currentPlayerIndex = 0;
        gameOver = false;
        winner = null;
    };

    const isGameOver = () => gameOver;

    return {
        initializePlayers,
        getCurrentPlayer,
        playRound,
        resetGame,
        isGameOver
    };
})();

// Display Controller Module (IIFE - Single Instance)
const DisplayController = (() => {
    const setupSection = document.getElementById('setupSection');
    const gameSection = document.getElementById('gameSection');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const player1Input = document.getElementById('player1Name');
    const player2Input = document.getElementById('player2Name');
    const currentPlayerDiv = document.getElementById('currentPlayer');
    const resultDisplay = document.getElementById('resultDisplay');
    const cells = document.querySelectorAll('.cell');

    const init = () => {
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    };

    const startGame = () => {
        const player1Name = player1Input.value;
        const player2Name = player2Input.value;

        GameController.initializePlayers(player1Name, player2Name);
        GameController.resetGame();

        setupSection.style.display = 'none';
        gameSection.style.display = 'block';

        updateDisplay();
        renderBoard();
    };

    const restartGame = () => {
        GameController.resetGame();
        updateDisplay();
        renderBoard();
        resultDisplay.textContent = '';
        resultDisplay.className = 'result-display';
    };

    const handleCellClick = (e) => {
        if (GameController.isGameOver()) return;

        const cellIndex = parseInt(e.target.dataset.index);
        const result = GameController.playRound(cellIndex);

        if (result.success) {
            renderBoard();
            
            if (result.gameOver) {
                if (result.winner) {
                    displayWinner(result.winner);
                } else if (result.tie) {
                    displayTie();
                }
            } else {
                updateDisplay();
            }
        }
    };

    const updateDisplay = () => {
        const currentPlayer = GameController.getCurrentPlayer();
        currentPlayerDiv.textContent = `Current Turn: ${currentPlayer.name} (${currentPlayer.marker})`;
    };

    const renderBoard = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = 'cell';
            
            if (board[index] !== "") {
                cell.classList.add('taken');
                cell.classList.add(board[index].toLowerCase());
            }
        });
    };

    const displayWinner = (winResult) => {
        resultDisplay.textContent = `🎉 ${winResult.winner.name} wins!`;
        resultDisplay.className = 'result-display winner';
        currentPlayerDiv.textContent = 'Game Over!';

        // Highlight winning cells
        winResult.winningCells.forEach(index => {
            cells[index].classList.add('winning');
        });
    };

    const displayTie = () => {
        resultDisplay.textContent = `🤝 It's a tie!`;
        resultDisplay.className = 'result-display tie';
        currentPlayerDiv.textContent = 'Game Over!';
    };

    return {
        init
    };
})();

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    DisplayController.init();
});

// Console testing functions (for development/testing)
const testGame = () => {
    console.log("=== Testing Tic Tac Toe ===");
    
    GameController.initializePlayers("Alice", "Bob");
    console.log("Players initialized:", GameController.getCurrentPlayer());
    
    // Simulate a game
    console.log("\nPlaying moves...");
    
    const moves = [0, 1, 3, 4, 6]; // X should win
    moves.forEach(move => {
        const result = GameController.playRound(move);
        console.log(`Move at ${move}:`, result);
        console.log("Board:", Gameboard.getBoard());
    });
    
    console.log("\nGame Over:", GameController.isGameOver());
};

// Uncomment to test in console:
// testGame();