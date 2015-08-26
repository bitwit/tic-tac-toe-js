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
