var gulp = require('gulp');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var glob = require('glob');
var del = require('del');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');


// minify javascript
gulp.task('js', function () {
    gulp.src('app/js/*.js')
    	.pipe(concat('multiColumn.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/'))
        .pipe(notify({ message: 'Finished minifying JavaScript'}));
});

// copy all files from /app/
gulp.task('copy', function () {
  return gulp.src([
  	'app/**/*',
  	'!app/assets/**/*.jpg',
  	'!app/js/*.js',
    '!app/index.html'
  	],{
  	 dot:true
  	}).pipe(gulp.dest('dist'))
      .pipe($.size({title: 'copy'}));
});

// watch task
gulp.task('watch', function () {
    gulp.watch('app/js/**/*.js', ['js']);
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('default', ['js', 'watch']);

gulp.task('build', ['clean'], function (cb) {
  runSequence('js', ['copy'], cb);
});