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
