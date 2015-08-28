# Tic Tac Toe JS

An implementation of tic tac toe in Javascript with AI.
Play here: http://bitwit.github.io/tic-tac-toe-js

Notes:
- Uses gulp to build and test project
- AI uses minimax algorithm with alpha beta pruning
- UI is implemented in Angular.js
- Game logic is written in CommonJS module format is easily bundled to run on client or server side

# Build tasks

- `gulp build`: Bundles app through Browserify
- `gulp serve`: Builds the project and serves up html page locally. Refreshes and lints files on code changes.
- `gulp test`: Bundles app through Mochify and runs tests
