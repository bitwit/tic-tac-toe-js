(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var config = require('./config');
var GRID_SIZE = config.GRID_SIZE;
var SCORE_BOUNDS = config.SCORE_BOUNDS;

module.exports = (function () {
	/**
	 * Artificial Intelligence
	 *
	 * @constructor AI
	 * @description The AI Object contains a reference to what player it is
	 *              and runs all functions related to making a turn decision from game states
	 * @param playerId - An inital playerId. Can be changed any time to 'think' as a different player
	 */
	function AI (playerId) {
		this.playerId = playerId;
		this.nextMove = null;
	}

	/**
	 * @public AI.calculateNextBestMove
	 * @description The entrypoint function that kicks off AI calculations
	 *              Since we know that the center point is most optimal, take it first, if available
	 * @param state - The game state to evaluate
	 */
	AI.prototype.calculateNextBestMove = function (state) {
		var self = this;
		this.nextMove = null;
		if(this._takeCenterIfAvailable(state)) {
			return; //Top priority is taking the middle, if available
		}
		//this._minimax(state, 0, -SCORE_BOUNDS, SCORE_BOUNDS);
		var possibleMoves = this._getPossibleNextStates(state);
		var alpha = -SCORE_BOUNDS;
		var choices = [];
		possibleMoves.forEach(function (move) {
			var score = self._minimax(move, 0, -SCORE_BOUNDS, SCORE_BOUNDS);
			if (score > alpha) {
				alpha = score;
				choices.length = 0;
				choices.push(move);
			} else if (score === alpha) {
				choices.push(move);
			}
		});
		this.nextMove = choices[0];
	};

	/**
	 * @private AI.isCenterAvailable
	 * @description a quick check if the center cell is empty, and set it as the next move
	 * @param state - The game state to evaluate
	 * @returns boolean
	 */
	AI.prototype._takeCenterIfAvailable = function (state) {
		var centerPoint = (GRID_SIZE - 1) / 2;
		if (state.grid[centerPoint][centerPoint] === null) {
			this.nextMove = state.copy();
			this.nextMove.addMarkerAtPosition(centerPoint, centerPoint);
			return true;
		}
		return false;
	};

	/**
	 * @private AI.minimax
	 * @description Runs through all possible states and scores them to maximize player benefit and minimize opponent benefit.
	 *              Runs recursively with an increasing depth level that lowers the relative strength of states that are
	 *              further down the tree of possibilities.
	 *              At depth level 0 we amalgamate all possibilities and their score and pick the best scoring option
	 *              Uses minimax algorithm with alpha beta pruning.
	 *              See: https://en.wikipedia.org/wiki/Alpha-beta_pruning
	 * @param state - The game state to evaluate
	 * @param depth - How far down the possibility tree we currently are
	 * @param alpha - lower boundary in alpha beta pruning
	 * @param beta - upper boundary in alpha beta pruning
	 * @returns score - a score value for the state
	 */
	AI.prototype._minimax = function (state, depth, alpha, beta) {
		if(state.remainingMoves === 0) {
			return this._evaluateScore(state, depth);
		}
		var possibleMoves = this._getPossibleNextStates(state);
		for(var i = 0; i < possibleMoves.length; i++) {
			var childState = possibleMoves[i];
			var score = this._minimax(childState, depth + 1, alpha, beta);
			//console.log(new Array(depth + 1).join('--'), state.playerTurn, childState.lastMarker, score);
			if (state.playerTurn === this.playerId) {
				alpha = Math.max(alpha, score);
				if(alpha >= beta) {
					return beta;
				}
			} else {
				beta = Math.min(beta, score);
				if(beta <= alpha) {
					return alpha;
				}
			}
		}
		return (state.playerTurn === this.playerId) ? alpha : beta;
	};

	/**
	 * @private AI.getPossibleNextStates
	 * @description Iterates over all possible next moves and retuns an array of cloned states
	 * @param state - the game state from which to spawn possiblilities
	 */
	AI.prototype._getPossibleNextStates = function (fromState) {
		var possibilities = [];
		for(var r = 0; r < GRID_SIZE; r++) {
			for(var c = 0; c < GRID_SIZE; c++) {
				if(fromState.grid[r][c] === null) {
					var state = fromState.copy();
					state.addMarkerAtPosition(r, c);
					possibilities.push(state);
				}
			}
		}
		return possibilities;
	};

	/**
	 * @private AI.evaluateScore
	 * @description Get the value of a final state.
	 *              This function can be called with states with no remaining moves to get a score
	 * @param state - the game state to evaluate
	 * @param depth - how far down the tree of possibilities we are when evaluating
	 */
	AI.prototype._evaluateScore = function (state, depth) {
		var score;
		if (state.winner !== null) { //there was a winner so it either positively or negatively impacts the AI player
			score = (this.playerId === state.winner) ? SCORE_BOUNDS - depth : depth - SCORE_BOUNDS;
		} else {
			score = 0; // it was a draw
		}
		return score;
	};

	return AI;
})();

},{"./config":4}],2:[function(require,module,exports){
'use strict';
var State = require('./State');
var AI = require('./AI');

module.exports = (function () {
	/**
	 * Game Object
	 *
	 * @constructor Game
	 * @description The game shell object that is exposed globally for interacting with
	 */
	function Game () {
		this.ai = new AI(1);
		this.state = new State();
		this.winner = null; // When the game is over, winner will be populated
		this._reset();
	}

	/**
	 * @public Game.newGame
	 * @description create a new game state
	 */
	Game.prototype.newGame = function () {
		this._reset();
	};

	/**
	 * @public Game.addMarkerAtPosition
	 * @description Adds a new marker on the game state and checks for gameover
	 */
	Game.prototype.addMarkerAtPosition = function (row, col) {
		if(this.winner !== null) {
			return false;
		}
		this.state.addMarkerAtPosition(row, col);
		this._checkGameOver();
		return true;
	};

	/**
	 * @public Game.triggerAITurn
	 * @description Trigger AI to make a decision for the player
	 * @param playerId - the ID of the player to 'think' on behalf of
	 */
	Game.prototype.triggerAITurn = function (playerId) {
		this.ai.playerId = playerId;
		this.ai.calculateNextBestMove(this.state);
		var move = this.ai.nextMove;
		console.log('next move', move);
		this.addMarkerAtPosition(move.lastMarker[0], move.lastMarker[1]);
	};

	/**
	 * @private Game.reset
	 * @description resets the game state and winner state
	 */
	Game.prototype._reset = function () {
		this.winner = null;
		this.state.reset();
	};

	/**
	 * @private Game.checkGameOver
	 * @description Checks the game state for a winner and sets it accordingly
	 */
	Game.prototype._checkGameOver = function () {
		this.winner = this.state.winner;
	};

	return Game;

})();

},{"./AI":1,"./State":3}],3:[function(require,module,exports){
'use strict';
var config = require('./config');
var GRID_SIZE = config.GRID_SIZE;

module.exports = (function () {
	/**
	 * Lines
	 * @description Calculate our valid winning line possibilities based on grid size
	 *              Line combinations are stored in the format of:
	 *              winningCombination = [r,c, r,c, r,c]
	 */
	var LINES = (function () {
		var lines = [];
		var diagonalTopLeft = [];
		var diagonalBottomLeft = [];
		for(var i = 0; i < GRID_SIZE; i++) {
			var rowLine = [];
			var colLine = [];
			for(var j = 0; j < GRID_SIZE; j++) {
				rowLine.push(i, j);
				colLine.push(j, i);
			}
			lines.push(rowLine, colLine);
			diagonalTopLeft.push(i, i);
			diagonalBottomLeft.push(GRID_SIZE - 1 - i, i);
		}
		lines.push(diagonalTopLeft, diagonalBottomLeft);
		return lines;
	})();

	/**
	 * Game State
	 *
	 * @constructor State
	 * @description Stores all information about the game state at any given time
	 *              It can be easily copied to spawn all possible states for AI decisions making
	 */
	function State () {
		this.grid = [ [], [], [] ];
		this.playerTurn = 0; // 0 will represent 'O' and 1 will represent 'X'
		this.lastMarker = null;
		this.remainingMoves = 0;
		this.winner = null;
		this.winningLine = null;
	}

	/**
	 * @public State.copy
	 * @description Creates a new state and copies all current property values
	 * @returns newState - A completely new state
	 */
	State.prototype.copy = function () {
		var newState = new State();
		newState.playerTurn = this.playerTurn;
		newState.remainingMoves = this.remainingMoves;
		for(var r = 0; r < GRID_SIZE; r++) {
			for(var c = 0; c < GRID_SIZE; c++) {
				newState.grid[r][c] = this.grid[r][c];
			}
		}
		return newState;
	};

	/**
	 * @public State.reset
	 * @description Resets the state to its original 'new game' property values
	 */
	State.prototype.reset = function () {
		for(var r = 0; r < GRID_SIZE; r++) {
			for(var c = 0; c < GRID_SIZE; c++) {
				this.grid[r][c] = null;
			}
		}
		this.playerTurn = 0;
		this.lastMarker = null;
		this.remainingMoves = GRID_SIZE * GRID_SIZE;
		this.winner = null;
		this.winningLine = null;
	};

	/**
	 * @public State.switchTurn
	 * @description toggles the player turn between 0 and 1
	 */
	State.prototype.switchTurn = function () {
		this.playerTurn = 1 - this.playerTurn;
	};

	/**
	 * @public State.addMarkerAtPosition
	 * @description Adds a new marker, changes the turn and checks for end game state
	 */
	State.prototype.addMarkerAtPosition = function (row, col) {
		this.grid[row][col] = this.playerTurn;
		this.lastMarker = [row, col];
		this.remainingMoves--;
		this.switchTurn();
		this.checkForWinner();
	};

	/**
	 * @public State.checkForWinner
	 * @description Iterates over all line combination possiblities and sets a winner/endGame if one is found
	 */
	State.prototype.checkForWinner = function () {
		var grid = this.grid;
		for(var i = 0; i < LINES.length; i++) {
			var l = LINES[i];
			var numCells = l.length / 2;
			var isWinner = true;
			var lastCell = null;
			for(var j = 0; j < numCells; j++) {
				var idx = (j * 2); //we are iterating over 2 coordinates at a time
				if(j === 0) {
					if(grid[l[0]][l[1]] === null) {
						isWinner = false;
						break;
					}
				} else if(lastCell !== grid[l[idx]][l[idx + 1]]) {
					isWinner = false;
					break;
				}
				lastCell = grid[l[idx]][l[idx + 1]];
			}
			if(isWinner) {
				this.winner = lastCell;
				this.winningLine = l;
				this.remainingMoves = 0;
				break;
			}
		}
	};

	return State;
})();

},{"./config":4}],4:[function(require,module,exports){
module.exports = {
    /**
     * Grid Size
     * @description Number of rows and columns in our Tic Tac Toe grid.
     */
    GRID_SIZE: 3,
    /**
     * Score Bounds
     * @description This is the upper/lower limit of the scoring
     *              to be used during minimax AI calulations
     */
    SCORE_BOUNDS: 10
};

},{}],5:[function(require,module,exports){
'use strict';
var Game = require('./Game');

/**
 * Tic Tac Toe
 * @description An Angular JS wrapper around the Game logic
 *              Manages interactions on the page as well as initiating AI turns
 */
angular.module('TicTacToe', ['ngAnimate'])
.controller('GameCtrl', function ($scope, $timeout) {
	var game = new Game();
	$scope.aiPlayer = 1;
	$scope.game = game;

	/**
	 * @public $scope.resetGame
	 * @description Resets the game state and triggers AI if it should go first
	 */
	$scope.resetGame = function (shouldAIGoFirst) {
		game.newGame();
		if(shouldAIGoFirst) {
			$scope.aiPlayer = 0;
			_doAITurn();
		} else {
			$scope.aiPlayer = 1;
		}
	};

	/**
	 * @public $scope.addMarker
	 * @description Adds a marker on the grid if it is the correct player turn
	 *              Also triggers AI if valid move and game is not over
	 */
	$scope.addMarker = function (row, col) {
		if(game.state.grid[row][col] !== null || game.state.playerTurn === $scope.aiPlayer) {
			return;
		}
		game.addMarkerAtPosition(row, col);
		if(game.state.remainingMoves !== 0 && game.state.playerTurn === $scope.aiPlayer) {
			_doAITurn();
		}
	};

	/**
	 * @public $scope.getEndGameText
	 * @description A helper function to display winning text in HTML document
	 */
	$scope.getEndGameText = function () {
		if(game.winner === null) {
			return 'Draw';
		}
		return (game.winner) ? 'X Wins!' : 'O Wins!';
	};

	/**
	 * @public $scope.isCellInWinningLine
	 * @description A helper function to highlight the winning cells that form a line
	 */
	$scope.isCellInWinningLine = function (row, col) {
		//if the game has no winner or the cell is null, we know it's false
		var cellValue = game.state.grid[row][col];
		var l = game.state.winningLine;
		if(game.winner === null || game.winner !== cellValue) {
			return false;
		}
		var numCells = l.length / 2;
		for(var j = 0; j < numCells; j++) {
			var idx = (j * 2); //we are iterating over 2 coordinates at a time
			if(l[idx] === row && l[idx + 1] === col) {
				return true;
			}
		}
		return false;
	};

	/**
	 * @private doAITurn
	 * @description Triggers the AI turn. Does not need to be exposed in $scope
	 */
	function _doAITurn () {
		$timeout(function () {
			game.triggerAITurn($scope.aiPlayer);
		}, 1000);
	}
});

},{"./Game":2}]},{},[5]);
