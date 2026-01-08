// script.js
(function() {
    // IIFE (Immediately Invoked Function Expression) - יוצר היקף מקומי כדי למנוע זיהום של משתנים גלובליים
    console.log('script.js loaded');
    // מדפיס ללוג כדי לאשר שהקובץ נטען

    let boardSize = 8;
    // גודל הלוח - 8x8 משבצות
    let board = [];
    // מערך דו-ממדי שמייצג את הלוח: 0 = ריק, 1 = שחקן 1, 2 = שחקן 2, 3 = שחקן 1 מלך, 4 = שחקן 2 מלך
    let gameBoard;
    // משתנה שישמור את אלמנט ה-DOM של הלוח (div#game-board)
    let turnDisplay;
    // משתנה שישמור את אלמנט ה-DOM שמציג את התור הנוכחי (div#turn-display)
    let possibleMovesDisplay;
    // משתנה שישמור את אלמנט ה-DOM שמציג מהלכים אפשריים (div#possible-moves)
    let gameOverDiv;
    // משתנה שישמור את אלמנט ה-DOM של הודעת סיום המשחק (div#game-over)
    let winMessage;
    // משתנה שישמור את אלמנט ה-DOM של הודעת הניצחון (p#win-message)
    let selectedPiece = null;
    // משתנה שישמור את הכלי שנבחר כרגע (אם אין כלי נבחר, יהיה null)
    let currentPlayer = 1;
    // שחקן נוכחי: 1 = שחקן 1 (חום כהה), 2 = שחקן 2 או מחשב (חום בהיר)
    let gameOverFlag = false;
    // דגל שמציין אם המשחק הסתיים (true = הסתיים, false = ממשיך)
    window.difficulty = 'easy';
    // משתנה גלובלי ששומר את רמת הקושי (easy או hard), נגיש גם מה-HTML

    // פונקציה שבודקת אם אנחנו במצב Single Player (שחקן נגד מחשב)
    function isSinglePlayerMode() {
        const mode = typeof window.isSinglePlayer !== 'undefined' ? window.isSinglePlayer : false;
        console.log('isSinglePlayerMode:', mode);
        return mode;
    }

    // פונקציה שמאתחלת משתנים לאחר טעינת ה-DOM
    function initializeGame() {
        console.log('initializeGame called');
        gameBoard = document.getElementById('game-board');
        turnDisplay = document.getElementById('turn-display');
        possibleMovesDisplay = document.getElementById('possible-moves');
        gameOverDiv = document.getElementById('game-over');
        winMessage = document.getElementById('win-message');

        console.log('gameBoard:', gameBoard);
        console.log('turnDisplay:', turnDisplay);
        console.log('possibleMovesDisplay:', possibleMovesDisplay);
        console.log('gameOverDiv:', gameOverDiv);
        console.log('winMessage:', winMessage);
        console.log('difficulty:', window.difficulty);
    }

    // פונקציה שמאתחלת את הלוח בתחילת המשחק
    function initializeBoard() {
        console.log('initializeBoard called');
        board = [];
        for (let row = 0; row < boardSize; row++) {
            board[row] = [];
            for (let col = 0; col < boardSize; col++) {
                board[row][col] = 0;
            }
        }
        for (let col = 0; col < boardSize; col++) {
            for (let row = 0; row < 3; row++) {
                if ((row + col) % 2 === 0) board[row][col] = 1; // Player 1 (Dark)
            }
            for (let row = 5; row < 8; row++) {
                if ((row + col) % 2 === 0) board[row][col] = 2; // Player 2 or Computer (Light)
            }
        }
        console.log('Board initialized:', board);
    }

    // פונקציה שמציגה את הלוח על המסך
    function renderBoard() {
        console.log('renderBoard called');
        if (!gameBoard) {
            console.error('Game board element not found!');
            return;
        }
        gameBoard.innerHTML = '';
        const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (row === 0) {
                    const colLabel = document.createElement('div');
                    colLabel.classList.add('label', 'col-label');
                    colLabel.textContent = cols[col];
                    cell.appendChild(colLabel);
                }
                if (col === 0) {
                    const rowLabel = document.createElement('div');
                    rowLabel.classList.add('label', 'row-label');
                    rowLabel.textContent = (boardSize - row).toString();
                    cell.appendChild(rowLabel);
                }

                if ((row + col) % 2 === 0) {
                    cell.classList.add('black');
                    if (board[row][col] === 1) {
                        const piece = document.createElement('div');
                        piece.classList.add('piece', 'player1');
                        cell.appendChild(piece);
                    } else if (board[row][col] === 2) {
                        const piece = document.createElement('div');
                        piece.classList.add('piece', 'player2');
                        cell.appendChild(piece);
                    } else if (board[row][col] === 3) { // תוספת: מלך שחקן 1
                        const piece = document.createElement('div');
                        piece.classList.add('piece', 'player1', 'king');
                        cell.appendChild(piece);
                    } else if (board[row][col] === 4) { // תוספת: מלך שחקן 2
                        const piece = document.createElement('div');
                        piece.classList.add('piece', 'player2', 'king');
                        cell.appendChild(piece);
                    }
                }
                cell.addEventListener('click', handlePieceClick);
                gameBoard.appendChild(cell);
            }
        }
        updateTurnDisplay();

        if (!gameOverFlag && selectedPiece) {
            const moves = getValidMoves(selectedPiece.row, selectedPiece.col);
            clearHighlights();
            moves.forEach(([moveRow, moveCol]) => {
                const cell = document.querySelector(`.cell[data-row="${moveRow}"][data-col="${moveCol}"]`);
                if (cell) {
                    console.log(`Highlighting cell at (${moveRow}, ${moveCol})`);
                    cell.classList.add('selected');
                } else {
                    console.log(`Cell at (${moveRow}, ${moveCol}) not found`);
                }
            });
            updatePossibleMoves(moves);
        }
    }

    // פונקציה שמטפלת בלחיצה על משבצת או כלי
    function handlePieceClick(event) {
        console.log('handlePieceClick called, Current Player:', currentPlayer);
        if (gameOverFlag) {
            console.log('Game is over, no moves allowed');
            return;
        }

        if (isSinglePlayerMode() && currentPlayer === 2) {
            console.log('Computer turn, human input blocked');
            return;
        }

        let target = event.target;
        if (target.classList.contains('piece') || target.classList.contains('cell')) {
            target = target.classList.contains('piece') ? target.parentElement : target;
        }
        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);
        if ((board[row][col] === 1 || board[row][col] === 3) && currentPlayer === 1 ||
            (board[row][col] === 2 || board[row][col] === 4) && currentPlayer === 2) {
            if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
                console.log('Deselecting piece at:', row, col);
                selectedPiece = null;
                clearHighlights();
                renderBoard();
            } else {
                console.log('Selecting new piece at:', row, col);
                selectedPiece = { row, col };
                const moves = getValidMoves(row, col);
                console.log('Valid moves for selected piece:', moves);
                renderBoard();
            }
        } else if (selectedPiece) {
            const moves = getValidMoves(selectedPiece.row, selectedPiece.col);
            const isValidMove = moves.some(([moveRow, moveCol]) => moveRow === row && moveCol === col);
            if (isValidMove) {
                console.log('Moving piece from', selectedPiece, 'to', { row, col });
                movePiece(selectedPiece.row, selectedPiece.col, row, col);
                selectedPiece = null;
                renderBoard();
                switchTurn();
                checkForWin();
            }
        }
    }

    // פונקציה שמחזירה את המהלכים החוקיים עבור כלי מסוים
    function getValidMoves(row, col) {
        const moves = [];
        const piece = board[row][col];
        const isKing = (piece === 3 || piece === 4);
        const directions = isKing
            ? [[1, -1], [1, 1], [-1, -1], [-1, 1]] // מלכים: כל הכיוונים
            : (piece === 1 ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]); // רגילים: כיוון אחד

        console.log(`Checking moves for piece ${piece} at (${row}, ${col}), isKing: ${isKing}`);

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (isValidMove(row, col, newRow, newCol)) {
                console.log(`Valid move: (${newRow}, ${newCol})`);
                moves.push([newRow, newCol]);
            }
        }

        for (const [dr, dc] of directions) {
            const midRow = row + dr;
            const midCol = col + dc;
            const newRow = row + 2 * dr;
            const newCol = col + 2 * dc;
            if (isValidCapture(row, col, midRow, midCol, newRow, newCol)) {
                console.log(`Valid capture: (${newRow}, ${newCol}) via (${midRow}, ${midCol})`);
                moves.push([newRow, newCol]);
            }
        }

        console.log(`Final valid moves for (${row}, ${col}):`, moves);
        return moves;
    }

    // פונקציה שבודקת אם תזוזה רגילה חוקית
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        if (toRow < 0 || toRow >= boardSize || toCol < 0 || toCol >= boardSize) return false;
        if (board[toRow][toCol] !== 0) return false;
        if (Math.abs(toRow - fromRow) !== 1 || Math.abs(toCol - fromCol) !== 1) return false;
        const piece = board[fromRow][fromCol];
        const isKing = (piece === 3 || piece === 4);
        const isValidDirection = isKing || (piece === 1 ? toRow > fromRow : toRow < fromRow);
        console.log(`Checking move from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol}): ${isValidDirection}`);
        return isValidDirection;
    }

    // פונקציה שבודקת אם קפיצה (אכילה) חוקית
    function isValidCapture(fromRow, fromCol, midRow, midCol, toRow, toCol) {
        if (toRow < 0 || toRow >= boardSize || toCol < 0 || toCol >= boardSize) return false;
        if (board[toRow][toCol] !== 0) return false;
        if (Math.abs(toRow - fromRow) !== 2 || Math.abs(toCol - fromCol) !== 2) return false;
        const piece = board[fromRow][fromCol];
        const opponent = piece === 1 || piece === 3 ? [2, 4] : [1, 3]; // יריבים (רגילים ומלכים)
        if (!opponent.includes(board[midRow][midCol])) return false;
        const isKing = (piece === 3 || piece === 4);
        const isValidDirection = isKing || (piece === 1 ? toRow > fromRow : toRow < fromRow);
        console.log(`Checking capture from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol}) via (${midRow}, ${midCol}): ${isValidDirection}`);
        return isValidDirection;
    }

    // פונקציה שמזיזה כלי ממיקום אחד לאחר
    function movePiece(fromRow, fromCol, toRow, toCol) {
        console.log(`Moving piece from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
        board[toRow][toCol] = board[fromRow][fromCol];
        board[fromRow][fromCol] = 0;
        if (Math.abs(toRow - fromRow) === 2) {
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            console.log(`Capturing piece at (${midRow}, ${midCol})`);
            board[midRow][midCol] = 0;
        }
        // תוספת: הפיכה למלך
        if (toRow === 7 && board[toRow][toCol] === 1) {
            board[toRow][toCol] = 3; // שחקן 1 הופך למלך
            console.log(`Player 1 piece at (${toRow}, ${toCol}) promoted to King`);
        } else if (toRow === 0 && board[toRow][toCol] === 2) {
            board[toRow][toCol] = 4; // שחקן 2 הופך למלך
            console.log(`Player 2 piece at (${toRow}, ${toCol}) promoted to King`);
        }
    }

    // פונקציה שמבצעת מהלך של המחשב (רק במצב Single Player)
    function computerMove() {
        console.log('computerMove called, Current Player:', currentPlayer);
        if (currentPlayer !== 2 || gameOverFlag || !isSinglePlayerMode()) return;

        const allMoves = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 2 || board[row][col] === 4) { // שחקן 2 או מלך
                    const moves = getValidMoves(row, col);
                    moves.forEach(([toRow, toCol]) => {
                        allMoves.push({ fromRow: row, fromCol: col, toRow, toCol });
                    });
                }
            }
        }

        console.log('All possible moves for computer:', allMoves);
        if (allMoves.length === 0) {
            checkForWin();
            return;
        }

        let move;
        if (window.difficulty === 'easy') {
            move = allMoves[Math.floor(Math.random() * allMoves.length)];
        } else {
            move = allMoves.find(m => Math.abs(m.toRow - m.fromRow) === 2) ||
                   allMoves[Math.floor(Math.random() * allMoves.length)];
        }

        if (move) {
            movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
            renderBoard();
            switchTurn();
            checkForWin();
        }
    }

    // פונקציה שמחליפה תור בין שחקנים
    function switchTurn() {
        console.log('switchTurn called');
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateTurnDisplay();
        if (isSinglePlayerMode() && currentPlayer === 2 && !gameOverFlag) {
            setTimeout(computerMove, 1000);
        } else if (!isSinglePlayerMode() && currentPlayer === 2) {
            console.log('Turn switched to Player 2');
        }
    }

    // פונקציה שמעדכנת את תצוגת התור
    function updateTurnDisplay() {
        console.log('updateTurnDisplay called');
        if (!turnDisplay) {
            console.error('Turn display element not found!');
            return;
        }
        if (isSinglePlayerMode()) {
            turnDisplay.textContent = currentPlayer === 1 ? 'Turn: Player' : 'Turn: Computer';
        } else {
            turnDisplay.textContent = currentPlayer === 1 ? 'Turn: Player 1' : 'Turn: Player 2';
        }
    }

    // פונקציה שמנקה סימונים של מהלכים אפשריים
    function clearHighlights() {
        console.log('clearHighlights called');
        const highlightedCells = document.querySelectorAll('.selected');
        highlightedCells.forEach(cell => cell.classList.remove('selected'));
    }

    // פונקציה שמעדכנת את תצוגת המהלכים האפשריים
    function updatePossibleMoves(moves) {
        console.log('updatePossibleMoves called');
        if (!possibleMovesDisplay) {
            console.error('Possible moves display element not found!');
            return;
        }
        possibleMovesDisplay.innerHTML = 'Possible Moves: ' + moves.map(([row, col]) => `(${row + 1}, ${col + 1})`).join(', ');
    }

    // פונקציה שבודקת אם יש ניצחון
    function checkForWin() {
        console.log('checkForWin called');
        let player1HasMoves = false;
        let player2HasMoves = false;
        let player1Pieces = 0;
        let player2Pieces = 0;
        let tempPlayer = currentPlayer;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 1 || board[row][col] === 3) {
                    player1Pieces++;
                    currentPlayer = 1;
                    if (getValidMoves(row, col).length > 0) player1HasMoves = true;
                }
                if (board[row][col] === 2 || board[row][col] === 4) {
                    player2Pieces++;
                    currentPlayer = 2;
                    if (getValidMoves(row, col).length > 0) player2HasMoves = true;
                }
            }
        }

        currentPlayer = tempPlayer;

        if (!player1HasMoves || !player2HasMoves) {
            let winnerMessage;
            if (player1Pieces > player2Pieces) {
                winnerMessage = isSinglePlayerMode()
                    ? `Player wins! (More pieces: ${player1Pieces} vs ${player2Pieces})`
                    : `Player 1 wins! (More pieces: ${player1Pieces} vs ${player2Pieces})`;
            } else if (player2Pieces > player1Pieces) {
                winnerMessage = isSinglePlayerMode()
                    ? `Computer wins! (More pieces: ${player2Pieces} vs ${player1Pieces})`
                    : `Player 2 wins! (More pieces: ${player2Pieces} vs ${player1Pieces})`;
            } else {
                winnerMessage = `Draw! (Equal pieces: ${player1Pieces})`;
            }
            gameOver(winnerMessage);
            return;
        }
    }
    // פונקציה שמסיימת את המשחק ומציגה הודעת ניצחון דרמטית
function gameOver(message) {
    console.log('gameOver called, message:', message);
    gameOverFlag = true; // מסמנים שהמשחק נגמר כדי שלא יהיו מהלכים נוספים.
    if (winMessage) winMessage.textContent = message; // שמים את הודעת הניצחון בטקסט.
    if (gameOverDiv) gameOverDiv.style.display = 'block'; // מציגים את החלון הדרמטי על כל המסך.
}

    // פונקציה שמאתחלת את המשחק מחדש
    function restartGame() {
        console.log('restartGame called');
        gameOverFlag = false;
        currentPlayer = 1;
        selectedPiece = null;
        if (gameOverDiv) gameOverDiv.style.display = 'none';
        initializeBoard();
        renderBoard();
    }

    // חשיפת הפונקציות לשימוש חיצוני (מה-HTML)
    window.initializeGame = initializeGame;
    window.initializeBoard = initializeBoard;
    window.renderBoard = renderBoard;
    window.handlePieceClick = handlePieceClick;
    window.computerMove = computerMove;
    window.switchTurn = switchTurn;
    window.updateTurnDisplay = updateTurnDisplay;
    window.clearHighlights = clearHighlights;
    window.updatePossibleMoves = updatePossibleMoves;
    window.checkForWin = checkForWin;
    window.gameOver = gameOver;
    window.restartGame = restartGame;
})();