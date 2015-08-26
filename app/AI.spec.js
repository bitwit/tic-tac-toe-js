'use strict';

var chai = require('chai');
var expect = chai.expect;

var State = require('./State.js');
var AI = require('./AI.js');

describe('AI Tests', function () {

  it('should select the middle', function () {
    var state = new State();
    var ai = new AI(1);
    state.remainingMoves = 3;
    state.playerTurn = 1;
    state.grid = [
      [0, null,    1],
      [1, null, null],
      [1,    0,    0]
    ];
    ai.calculateNextBestMove(state);
    var move = ai.nextMove;
    expect(move.lastMarker[0]).to.equal(1);
    expect(move.lastMarker[1]).to.equal(1);
  });

  it('should select the middle', function () {
    var state = new State();
    var ai = new AI(1);
    state.remainingMoves = 9;
    state.playerTurn = 1;
    state.grid = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    ai.calculateNextBestMove(state);
    var move = ai.nextMove;
    expect(move.lastMarker[0]).to.equal(1);
    expect(move.lastMarker[1]).to.equal(1);
  });

  it('should select the middle edge', function () {
    var state = new State();
    var ai = new AI(1);
    state.remainingMoves = 6;
    state.playerTurn = 1;
    state.grid = [
      [0, null, null],
      [null, 1, null],
      [null, 0, null]
    ];
    ai.calculateNextBestMove(state);
    var move = ai.nextMove;
    expect(move.lastMarker[0]).to.equal(1);
    expect(move.lastMarker[1]).to.equal(0);
  });

});
