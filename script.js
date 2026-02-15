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
        currentPlayerIndex = 0;
        gameOver = false;
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
                // Find which player has this marker
                const winningMarker = board[a];
                const winningPlayer = players.find(p => p.marker === winningMarker);
                return {
                    winner: winningPlayer,
                    winningCells: combination
                };
            }
        }
        return null;
    };

    const playRound = (cellIndex) => {
        if (gameOver) {
            console.log("Game is over!");
            return { success: false };
        }

        const currentPlayer = getCurrentPlayer();
        console.log(`Playing round: Player ${currentPlayer.name} (${currentPlayer.marker}) at cell ${cellIndex}`);
        
        // Try to place marker
        if (Gameboard.setCell(cellIndex, currentPlayer.marker)) {
            console.log("Marker placed successfully");
            console.log("Board state:", Gameboard.getBoard());
            
            // Check for winner
            const winResult = checkWinner();
            if (winResult) {
                gameOver = true;
                winner = winResult;
                console.log("Winner found:", winResult.winner.name);
                return { 
                    success: true, 
                    gameOver: true, 
                    winner: winResult 
                };
            }

            // Check for tie
            if (Gameboard.isFull()) {
                gameOver = true;
                console.log("Game is a tie!");
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
        
        console.log("Cell already taken!");
        return { success: false };
    };

    const resetGame = () => {
        Gameboard.resetBoard();
        currentPlayerIndex = 0;
        gameOver = false;
        winner = null;
        console.log("Game reset");
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
        console.log("Initializing DisplayController");
        console.log("Cells found:", cells.length);
        
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);
        
        cells.forEach((cell, index) => {
            console.log(`Adding listener to cell ${index}`);
            cell.addEventListener('click', handleCellClick);
        });
    };

    const startGame = () => {
        console.log("Starting game");
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
        console.log("Restarting game");
        GameController.resetGame();
        
        // Clear all cells
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Clear result display
        resultDisplay.textContent = '';
        resultDisplay.className = 'result-display';
        
        // Update current player display
        updateDisplay();
    };

    const handleCellClick = (e) => {
        console.log("Cell clicked!");
        
        if (GameController.isGameOver()) {
            console.log("Game is over, ignoring click");
            return;
        }

        const cell = e.target;
        const cellIndex = parseInt(cell.dataset.index);
        console.log(`Cell index: ${cellIndex}`);
        
        // Check if cell is already taken
        if (cell.classList.contains('taken')) {
            console.log("Cell already taken");
            return;
        }

        const result = GameController.playRound(cellIndex);
        console.log("Play round result:", result);

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
        console.log("Display updated:", currentPlayer.name);
    };

    const renderBoard = () => {
        console.log("Rendering board");
        const board = Gameboard.getBoard();
        console.log("Board state:", board);
        
        cells.forEach((cell, index) => {
            const marker = board[index];
            console.log(`Cell ${index}: ${marker}`);
            
            cell.textContent = marker;
            cell.className = 'cell';
            
            if (marker !== "") {
                cell.classList.add('taken');
                cell.classList.add(marker.toLowerCase());
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
    console.log("DOM Content Loaded");
    DisplayController.init();
});