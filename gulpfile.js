var gulp = require('gulp');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var glob = require('glob');
var del = require('del');


// minify javascript
gulp.task('js', function () {
    gulp.src('js/*.js')
    	.pipe(concat('multiColumn.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'Finished minifying JavaScript'}));
});

// watch task
gulp.task('watch', function () {
    gulp.watch('js/**/*.js', ['js']);
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('default', ['js', 'watch']);