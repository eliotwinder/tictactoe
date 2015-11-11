var Game = function( player, board ) {
  this.board = board || [[0,0,0],[0,0,0],[0,0,0]];
  this.turn = 0;

  this.bestMove;
  
  // set player Xs or Os
  this.player = player;

  // set computer Xs and 0s
  if (this.player === 'X') {
    this.computer = 'O';
  } else {
    this.computer = 'X';
  }
  
};

// ***** GAMEPLAY LOGIC *****

Game.prototype.playerTurn = function() {
  var gameRef = this;

  // for each row
  $('.board').children().each(function(i){
    
    // for each space
    $(this).children().each(function(j){

      // if the space is not taken
      if ($(this).text() === ''){
        
        // add an event listener
        $(this).on('click', function(){
          var row = $(this).data('row');
          var column = $(this).data('column');

          // remove listeners when player moves
          $('.board').find('div').off('click');           
          gameRef.makeMove([row, column]);
        });
      }
    });
  });
};

Game.prototype.newGame = function() {
  $('.board').empty()
};

Game.prototype.computerTurn = function() {
  this.miniMax(0)
  return this.makeMove(this.bestMove);
};

Game.prototype.makeBoard = function() {
  // create board
  var board = document.createElement('div');
  $(board).addClass('board');

  // add rows to board
  for (var i = 0; i < 3; i++) {
    var rowNode = document.createElement('div');
    $(rowNode).addClass('board-row');

    // add spaces to row
    for (var j = 0; j < 3; j++) {
      var spaceNode = document.createElement('div');
      $(spaceNode).addClass('board-space col-xs-4');
      $(spaceNode).data('row', i)
      $(spaceNode).data('column', j)
      $(rowNode).append(spaceNode);
    }

    $(board).append(rowNode);
  } 

  return $(board);
};

Game.prototype.makeMove = function(space) {
  var turn = this.getTurn();
  var row = space[0];
  var column = space[1];

  // update game board
  this.board[row][column] = turn;
  
  // update DOM
  var $row = $('.board').children().eq(row);
  $row.children().eq(column).text(turn);

  if (this.checkWin(this.computer)) {
    // remove listeners so player can't move any more
    $('.board').find('div').off('click');
   
    // end game offer new game
    $('.lose').show();

    $('.gameover').show();

    createNewGame();

  } else if (this.isBoardFull()) {
    // remove listeners so player can't move any more
    $('.board').find('div').off('click');

    // end the game and offer a new game
    $('.tie').show();
    $('.gameover').show();
    createNewGame();

    //add new game listener

  } else {
    // make it next player's move
    this.turn++;
    if (this.getTurn() === this.computer) {
      this.computerTurn();
    } else {
      this.playerTurn();
    }
  }
};

// ***** GAME STATE CHECK HELPERS *****
Game.prototype.getTurn = function() {
  if (this.turn % 2 === 0) {
    return 'X';
  } else {
    return 'O';
  }
};

Game.prototype.getMoves = function() {
  var moves = [];
  this.board.forEach(function(row, i) {
    row.forEach(function(space, j){
      if (!space) {
        moves.push([i, j]);
      }
    });
  });

  return moves;
};

Game.prototype.checkWin = function(pip) {
  return this.checkRows(pip) || this.checkColumns(pip) || 
      this.checkRightDiagonal(pip) || this.checkLeftDiagonal(pip);
};

Game.prototype.isGameOver = function() {
  return this.checkWin('X') || this.checkWin('O') || this.isBoardFull();
};

Game.prototype.isBoardFull = function() {
  for (var i = 0; i < this.board.length; i++) {
    for (var j = 0; j < this.board[0].length; j++) {
      if (!this.board[i][j]) {
        return false;
      }
    }
  }

  return true;
};

// Lets us know if we only have 1 or 2 pips on the board to avoid recalculating
Game.prototype.isBoardEmpty = function() {
  for (var i = 0; i < this.board.length; i++) {
    for (var j = 0; j < this.board[0].length; j++) {
      if (this.board[i][j]) {
        return false;
      }
    }
  }

  return true;
};

Game.prototype.checkRows = function(pip) {
  for (var i = 0; i < this.board.length; i++) {
    var pipCount = 0;
    var row = this.board[i];
    for (var j = 0; j < row.length; j++) {
      if (row[j] === pip) {
        pipCount++;
      }
    }
    if (pipCount === 3) {
      return true;
    }
  }

  return false;
};

Game.prototype.checkColumns = function(pip) {
  for (var i = 0; i < this.board.length; i++) {
    var pipCount = 0;
    var row = this.board[i];
    for (var j = 0; j < row.length; j++) {
      if (this.board[j][i] === pip) {
        pipCount++;
      }
    }
    if (pipCount === 3) {
      return true;
    }
  }
  return false;
};

Game.prototype.checkRightDiagonal = function(pip) {
  var diagonal = this.board.map(function(row, index) {
    return row[index];
  });

  var matchingPips = diagonal.filter(function(space) {
    return ( space === pip);
  });

  if (matchingPips.length === this.board.length) {
    return true;
  }

  return false;
};


Game.prototype.checkLeftDiagonal = function(pip) {
  var diagonal = this.board.map(function(row, index) {
    return row[row.length - 1 - index];
  });

  var matchingPips = diagonal.filter(function(space) {
    return ( space === pip);
  });

  if (matchingPips.length === this.board.length) {
    return true;
  }

  return false;
};


// ***** COMPUTER PLAYER / MINIMAX *****

// returns score if game is over, false if it is not
Game.prototype.makePossibleMove = function(move) {
  var row = move[0];
  var column = move[1];

  // add the move to the board
  this.board[row][column] = this.getTurn();

  // move to next turn
  this.turn++;
};

Game.prototype.cancelPossibleMove = function(move) {
  var row = move[0];
  var column = move[1];

  // remove the  move from the board
  this.board[row][column] = 0;

  // move back a turn
  this.turn--;
};

Game.prototype.scoreGame = function(depth) {
  // check if someone wins
  if (this.checkWin(this.computer)) {
    return 10 - depth;
  } else if (this.checkWin(this.player)) {
    return depth - 10;
  } else {
    return 0;
  }
};

Game.prototype.miniMax = function(depth) {
  
  // because the first move takes a while, hard code the first move in
  if (this.isBoardEmpty()) {
    this.bestMove = [0,0];
    return;
  }
  // if the game is over, return the score
  if (this.isGameOver()) {
    return this.scoreGame(depth);
  }
  depth += 1;
  var moves = [];
  var scores = []; 
  var game = this;
  this.getMoves().forEach(function(move, index, array) {
    // console.log(game.getTurn(), move, depth);
    // console.log(game.board)
    game.makePossibleMove(move);
    // console.log(game.board)
    moves.push(move);
    scores.push(game.miniMax(depth))
    game.cancelPossibleMove(move);    
    // console.log('after',game.board, game.getTurn());
  });

  // console.log(depth, moves, scores);
  // if it is the computer's turn, find max points
  if (this.getTurn() === this.computer) {
    var maxIndex;
    var max;

    scores.forEach(function(score, index) {
      if (max === undefined) {
        max = score;
        maxIndex = index;
      } else if (score > max) {
        max = score;
        maxIndex = index;
      }
    });

    this.bestMove = moves[maxIndex];
    return max;
  } else {
    var minIndex;
    var min;

    scores.forEach(function(score, index) {
      if (min === undefined) {
        min = score;
        minIndex = index;
      } else if (score < min) {
        min = score;
        minIndex = index;
      }
    });

    this.bestMove = moves[minIndex];
    return scores[minIndex];
  }
};

// ***** INITIALIZE GAME ******
var createNewGame = function() {
  $('.pickpip div').on('click', function(e) {

    // find out if player chose xs or os
    var playerChoice = $(this).data('pip');
    
    // hide pip selection
    $('.intro').hide();
    $('.gameover').hide();
    $('.lose').hide();
    $('.tie').hide();
    
    // create a new game instance
    var game = new Game(playerChoice);
    
    // attach the game domNode to the dom
    $('.game').empty().append(game.makeBoard());
    
    if (playerChoice === 'X') {
      game.playerTurn();
    } else {
      game.computerTurn()
    }
  });
};

$(function() {
  // add listeners for whether player wants to be xs or os
  createNewGame();
});
