var path = require('path');
var pkg = require('./package.json');
var gulp = require('gulp');
var through = require('through2');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync').create();

var jsHint = require('gulp-jshint');
var jsHintStylish = require('jshint-stylish');
var browserify = require('browserify');
var mochify = require('mochify');

var src = {
  app: 'app',
  out: 'out'
};

/**
 * DEVELOPMENT
 */
gulp.task('serve', function () {
  gulp.watch(src.app + '/**/**.js', ['rebuild']);
  browserSync.init({
    server: {
      baseDir: './'
    },
    startPath: '/index.html'
  });
});

gulp.task('jsHint', function () {
  return gulp.src([
    src.app + '/**/**.js',
    '!' + src.app + '/**/**.spec.js'
  ])
  .pipe(plumber())
  .pipe(jsHint())
  .pipe(jsHint.reporter(jsHintStylish));
});

gulp.task('rebuild', ['jsHint', 'build'], function (){
  browserSync.reload();
});

/**
 * BUILD
 */
gulp.task('build', function () {
  var b = browserify([src.app + '/main.js'])
  return b.bundle()
  .on('error', function (err) {
    console.log(err);
    this.emit('end');
  })
  .pipe(plumber())
  .pipe(source('bundle.js'))
  .pipe(gulp.dest(src.out));
});

/**
 * TESTS
 */
gulp.task('test', function () {
  var fileNames = [];
  return  gulp.src([
    src.app + '/**/**.spec.js'
  ])
  .pipe(through.obj(function (file, enc, next) {
    var path = file.path.replace(__dirname, '.');
    fileNames.push(path);
    next();
  }, function (next) {
    mochify(fileNames.join(' '), {
      reporter: 'spec',
      watch: (process.env.WATCH) ? true : false
    })
    .on('error', function (err) {
      next(err);
    })
    .on('end', function () {
      console.log('end', arguments);
      next();
    })
    .bundle();
  }));
});


