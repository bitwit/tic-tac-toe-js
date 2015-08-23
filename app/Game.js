window.Game = (function () {
	'use strict';

	var GRID_SIZE = 3;
	var BOUNDS = 1000; //For the alpha beta pruning initial limits
	var LINES = [
		//Column Lines
		[0,0, 1,0 , 2,0],
		[0,1, 1,1 , 2,1],
		[0,2, 1,2 , 2,2],
		//Row Lines
		[0,0, 0,1 , 0,2],
		[1,0, 1,1 , 1,2],
		[2,0, 2,1 , 2,2],
		//Diagonals
		[0,0, 1,1 , 2,2],
		[2,0, 1,1 , 0,2],
	];

	/**
	 * Game State
	 *
	 * @description Stores all information about the game state at any given time
	 *              It can be easily copied to spawn all possible states for AI decisions making
	 */

	function State () {
		this.grid = [ [], [], [] ];
		this.playerTurn = 0; // 0 will represent 'O' and 1 will represent 'X'
		this.lastMarker = null;
		this.remainingMoves = 0;
	}

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

	State.prototype.reset = function () {
		for(var r = 0; r < GRID_SIZE; r++) {
			for(var c = 0; c < GRID_SIZE; c++) {
				this.grid[r][c] = null;
			}
		}
		this.remainingMoves = GRID_SIZE * GRID_SIZE;
	};

	State.prototype.switchTurn = function () {
		this.playerTurn = 1 - this.playerTurn;
	};

	State.prototype.addMarkerAtPosition = function (row, col) {
		this.grid[row][col] = this.playerTurn;
		this.lastMarker = [row, col];
		this.remainingMoves--;
		//console.log('moves left ', this.remainingMoves);
		this.switchTurn();
	};

	State.prototype.getWinner = function () {
		var grid = this.grid;
		for(var i = 0; i < LINES.length; i++) {
			var l = LINES[i];
			var cell1 = grid[l[0]][l[1]];
			var cell2 = grid[l[2]][l[3]];
			var cell3 = grid[l[4]][l[5]];
			if(cell1 !== null && cell1 === cell2 && cell2 === cell3) {
				return cell1;
			}
		}
		return null;
	}

	/**
	 * Artificial Intelligence
	 * @description The AI Object contains a reference to what player it is
	 *              and runs all functions related to making a turn decision from game states
	 */

	function AI (playerId) {
		this.playerId = playerId;
	}

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

	AI.prototype._getPlayerScoresForStates = function (depth, states, alpha, beta) {
		var self = this;
		return states.map(function (move) {
			var winner = move.getWinner();
			if (winner !== null) {
				return (self.playerId === winner) ? 10 - depth : depth - 10;
			} else if (move.remainingMoves === 0) { // if there was only one move left, it's a draw
				return 0;
			}

			var possibilities = self._getPossibleNextStates(move);
			var allScores = self._getPlayerScoresForStates(depth + 1, possibilities, alpha, beta);
			var value;
			if (move.playerTurn === self.playerId) { //this means it was just an opponent move
				value = -BOUNDS;
				for(var i = 0; i < allScores.length; i++){
					var score = allScores[i];
					value = Math.max(alpha, score);
					alpha = Math.max(alpha, value);
					if (beta <= alpha) {
						break;
					}
				}
				return value;
			} else {
				value = BOUNDS;
				for(var i = 0; i < allScores.length; i++){
					var score = allScores[i];
					value = Math.min(value, score);
					beta = Math.min(beta, value);
					if (beta <= alpha) {
						break;
					}
				};
				return value;
			}
		});
	};

	AI.prototype._calculateNextBestMove = function (state) {
		var nextMoves = this._getPossibleNextStates(state);
		console.log('getting scores for states');
		var scores = this._getPlayerScoresForStates(0, nextMoves, -BOUNDS, BOUNDS);
		var highestIndex;
		var highestScore = scores.reduce(function (prev, value, index) {
			if (prev === null) {
				highestIndex = index;
				return value;
			}
			else if(value > prev) {
				highestIndex = index;
				return value;
			}
			return prev;
		}, null);
		console.log('moves, scores', nextMoves, scores, highestIndex, highestScore);
		return nextMoves[highestIndex];
	};

	/**
	 * Game Object
	 */

	function Game () {
		this.ai = new AI(1);
		this.state = new State();
		this.winner = null; // When the game is over, winner will be populated
		this._reset();
	}


	Game.prototype._reset = function () {
		this.winner = null;
		this.state.reset();
	};

	Game.prototype._isEmptyAtPosition = function (row, col) {
		return this.state.grid[row][col] === null;
	};

	Game.prototype._checkGameOver = function () {
		this.winner = this.state.getWinner();
	};

	Game.prototype.newGame = function () {
		this._reset();
	};

	Game.prototype.addMarkerAtPosition = function (row, col) {
		var self = this;
		if(self.winner !== null) {
			return false;
		}
		self.state.addMarkerAtPosition(row, col);
		self._checkGameOver();
		if(self.winner !== null) {
			console.log('Winner! ->', this.winner);
		}
		return true;
	};

	Game.prototype.triggerAITurn = function () {
		var move = this.ai._calculateNextBestMove(this.state);
		this.addMarkerAtPosition(move.lastMarker[0], move.lastMarker[1]);
	};

	return Game;

})();
