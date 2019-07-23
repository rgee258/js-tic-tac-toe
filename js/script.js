/* Modules and Factories */

const gameBoard = (() => {
  let board = ["&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp",
    "&nbsp", "&nbsp", "&nbsp"];

  const getBoard = () => board;

  const updateBoard = (position, mark) => {
    if (board[position] === "&nbsp") {
      board[position] = mark;
    }
    else {
      window.alert("That spot is already marked.");
    }
  };

  const resetBoard = () => {
    board = ["&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp", 
      "&nbsp", "&nbsp", "&nbsp"];
  };

  // For checking for three in a row
  const checkThree = (posOne, posTwo, posThree) => {
    // Check first that all three are occupied
    if (board[posOne] != "&nsbp" && board[posTwo] != "&nsbp" &&
      board[posThree] != "&nsbp") {
      // Begin comparing values
      if (board[posOne] === board[posTwo]) {
        if (board[posTwo] === board[posThree]) {
          if (board[posThree] === "X") {
            return "p1";
          }
          else if (board[posThree] === "O") {
            return "p2";
          }
        }
      }
    }
    return "ongoing";
  }

  // Object to store winning positions for iteration
  const winPositions = {
    topRow: [0, 1, 2],
    middleRow: [3, 4, 5],
    bottomRow: [6, 7, 8],
    leftCol: [0, 3, 6],
    middleCol: [1, 4, 7], 
    rightCol: [2, 5, 8],
    leftDiag: [0, 4, 8],
    rightDiag: [2, 4, 6]
  }

  const checkWin = () => {
    for (let checkPos in winPositions) {
      currentThree = winPositions[checkPos];
      check = checkThree(currentThree[0], currentThree[1], 
        currentThree[2]);
      if (check != "ongoing") {
        // Return p1 or p2 to get the winning player
        return check;
      }
    }
    // Otherwise return "ongoing"
    return check;
  }

  return {getBoard, updateBoard, resetBoard, checkWin};
})();

const playerFactory = (name, mark) => {
  const getName = () => name;
  const getMark = () => mark;

  return {getName, getMark};
}

const displayController = (() => {
  const displayBoard = (board) => {
    for (let i = 0; i < board.length; i++) {
      document.querySelector(`.pos-${i}`).innerHTML = board[i];
    }
  };

  // For usage on DOM load to add the new game button event
  const setup = () => {
    newBtn = document.querySelector(".new-game");
    newBtn.addEventListener("click", function() {
      gameHandler.newGame();
    });
  }

  // Remember, events and IIFEs DO NOT GET ALONG!
  // See the changeTurn method in the gameHandler for more details.
  const addMarkEvents = (board, activeMark) => {
    for (let i = 0; i < board.length; i++) {
      currentPos = document.querySelector(`.pos-${i}`);
      if (board[i] === "&nbsp") {
        // Empty class used for cursor styling
        currentPos.classList.add("empty");
        currentPos.addEventListener("click", function() {
          gameBoard.updateBoard(i, activeMark);
          gameHandler.changeTurn();
        });
      }
    }
  }

  const removeMarkEvents = (board) => {
    for (let i = 0; i < board.length; i++) {
      currentPos = document.querySelector(`.pos-${i}`);
      currentPos.classList.remove("empty");
      // Clone the nodes and reinsert them to remove old events
      replacePos = currentPos.cloneNode(true);
      currentPos.parentNode.replaceChild(replacePos, currentPos);
    }
  }

  const displayInfo = (player) => {
    document.querySelector(".info").innerHTML = 
      player + "'s Turn";
  }

  const displayWin = (winner) => {
    document.querySelector(".info").innerHTML =  
    `${winner} is the winner!`;
  }

  const displayTie = () => {
    document.querySelector(".info").innerHTML = "This game is a tie!";
  }

  const hideControls = () => {
    document.querySelector(".controls").classList.add("hide");
  }

  const showControls = () => {
    document.querySelector(".controls").classList.remove("hide");
  }

  return {displayBoard, addMarkEvents, removeMarkEvents, displayWin,
    displayTie, displayInfo, setup, hideControls, showControls};
})();

const gameHandler = (() => {
  let playerOne;
  let playerTwo;
  let turnCount = 0;

  const assignPlayers = () => {
    let nameOne = document.querySelector("#player-one-name").value;
    let nameTwo = document.querySelector("#player-two-name").value;

    function checkName(name, defaultName) {
      // Handle if name form is empty
      if (name) {
        // Remove whitespace and if it's still empty use default
        trimmedName = name.trim();
        if (trimmedName.length === 0) {
          return defaultName;
        }
        else {
          return name.trim();
        }
      }
      else {
        return defaultName;
      }
    }

    playerOne = playerFactory(checkName(nameOne, "Player 1"), "X");
    playerTwo = playerFactory(checkName(nameTwo, "Player 2"), "O");
  };

  const newGame = () => {
    displayController.hideControls();
    assignPlayers();
    turnCount = 1;
    gameBoard.resetBoard();
    displayController.displayBoard(gameBoard.getBoard());
    newTurn();
  }

  // Originally, the plan was to attach changeTurn to each click
  // event and update the board as the first line in changeTurn.
  // However, because it's in a module and a IIFE, this caused
  // changeTurn to be called on event attachment and immediately 
  // change to the newTurn so the board would automatically loop 
  // and add all of the marks without player input.
  const changeTurn = (position, activeMark) => {
    // Display the board with the player's move
    displayController.displayBoard(gameBoard.getBoard());
    if (gameWon()) {
      return;
    }
    else {
      turnCount++;
      newTurn();
    }
  }

  const newTurn = () => {
    displayController.removeMarkEvents(gameBoard.getBoard());
    if (turnCount < 10) {
      if (turnCount % 2 == 0) {
        displayController.displayInfo(playerTwo.getName());
        displayController.addMarkEvents(gameBoard.getBoard(), playerTwo.getMark());
      }
      else {
        displayController.displayInfo(playerOne.getName());
        displayController.addMarkEvents(gameBoard.getBoard(), playerOne.getMark());
      }
    }
  }

  const gameWon = () => {
    let winner = gameBoard.checkWin();
    // End the game here on a player winning
    if (winner != "ongoing") {
      displayController.removeMarkEvents(gameBoard.getBoard());
      if (winner === "p1") {
        displayController.displayWin(playerOne.getName());
      }
      else if (winner === "p2") {
        displayController.displayWin(playerTwo.getName());
      }
      displayController.showControls();
      return true;
    }
    else {
      // End the game here on a tie
      if (turnCount == 9) {
        displayController.displayTie();
        displayController.showControls();
        return true;
      }
      // Otherwise continue the game
      else {
        return false;
      }
    }
  }

  return {newGame, changeTurn};
})();

/* Run on DOM Load */

document.addEventListener("DOMContentLoaded", function(event) {
  displayController.setup();
});