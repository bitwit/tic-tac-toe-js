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
