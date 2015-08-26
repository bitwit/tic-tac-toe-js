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
		this.nextMove = null;
		var centerPoint = (GRID_SIZE - 1) / 2;
		if(state.grid[centerPoint][centerPoint] === null) {
			//Top priority is taking the middle, if available
			this.nextMove = state.copy();
			this.nextMove.addMarkerAtPosition(centerPoint, centerPoint);
		} else {
			this._minimax(state, 0, -SCORE_BOUNDS, SCORE_BOUNDS);
		}
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
		var candidateMoves = (depth === 0) ? [] : null;
		for(var i = 0; i < possibleMoves.length; i++) {
			var childState = possibleMoves[i];
			var score = this._minimax(childState, depth + 1, alpha, beta);
			//console.log(new Array(depth + 1).join('--'), state.playerTurn, childState.lastMarker, score);
			if (state.playerTurn === this.playerId) {
				if(depth === 0) {
					candidateMoves.push([childState, score]);
				}
				alpha = Math.max(alpha, score);
			} else {
				beta = Math.min(beta, score);
			}
		}

		if(depth === 0) {
			this._filterBestMove(candidateMoves);
		}
		var value;
		if (state.playerTurn === this.playerId) {
			value = alpha;
		}
		value = beta;
		return value;
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

	/**
	 * @private AI.filterBestMove
	 * @description Accepts a 2d array of moves and their relative scores and selects the highest scoring option
	 * @param moves - [ [state, score] ]
	 */
	AI.prototype._filterBestMove = function (moves) {
		if(!moves.length) { //no moves to filter
			return;
		}
		var highestIndex;
		moves.reduce(function (highest, move, index) {
			console.log('possible move', move[0].lastMarker, move[1]);
			var score = move[1];
			if (highest === null) {
				highestIndex = index;
				return score;
			}
			else if(score > highest) {
				highestIndex = index;
				return score;
			}
			return highest;
		}, null);

		this.nextMove = moves[highestIndex][0];
	};

	return AI;
})();
