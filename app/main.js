angular.module('TicTacToe', ['ngAnimate'])
.controller('GameCtrl', function ($scope, $timeout) {
	var game = new Game();
	$scope.game = game;

	$scope.resetGame = function () {
		game.newGame();
	};

	$scope.addMarker = function (row, col) {
		if(game.state.grid[row][col] !== null) {
			return;
		}

		game.addMarkerAtPosition(row, col);
		if(game.state.playerTurn === 1) {
			$timeout(function () {
				game.triggerAITurn();
			}, 1000);
		}
	}
});
