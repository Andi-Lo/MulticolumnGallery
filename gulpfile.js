// generated on 2015-01-26 using generator-4dev 0.1.0
// last update: 23.02.2015

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var glob = require('glob');
var del = require('del');
var $ = require('gulp-load-plugins')();
var pagespeed = require('psi');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var imageResize = require('gulp-image-resize');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var gulpBrowserify = require('gulp-browserify');
var gulpif = require('gulp-if');
var webp = require('gulp-webp');
var rename = require('gulp-rename');
var useref = require('gulp-useref');
var jpegtran = require('imagemin-jpegtran');
var site = 'http://www.andreaslorer.de';

module.exports = gulp;

// browserify task: builds a bundle out of your scripts
gulp.task('buildBundle', function() {
  // Single entry point to browserify
  return gulp.src('./site/assets/js/Ajax.js')
    .pipe(gulpBrowserify({
      insertGlobals : false
    }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./dist/assets/js/'));
});

// bundler
var bundler = watchify(browserify('./site/assets/js/Ajax.js', watchify.args));
// add any other browserify options or transforms here
// bundler.transform(brfs);

gulp.task('bundle', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler

function bundle() {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you dont want sourcemaps
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist/assets/js/'))
    .pipe(gulp.dest('./site/assets/js/'));
}

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('site/assets/js/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'))
    .pipe(reload({stream: true}));
});

// javascript
gulp.task('js', ['buildBundle'], function () {
  return gulp.src(['site/assets/js/*.js', 'dist/assets/js/bundle.js'])
    .pipe(concat('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js/'));
});

// assets task: minify html document with all its assets
gulp.task('assets', function () {
  var assets = useref.assets();
  return gulp.src('site/*.html')
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});


gulp.task('copy', function () {
  return gulp.src([
    'site/**/*',
    '!site/assets/js/*',
    '!site/assets/magnific-popup/magnific-popup.css',
    '!site/assets/images/*',
    '!site/assets/images/',
    '!site/assets/thumbs/*',
    '!site/assets/thumbs/',
    '!site/assets/css/**/*',
    '!site/assets/css/',
    '!site/bower_components/**/*',
    '!site/bower_components/',
    ],{
     dot:true
    }).pipe(gulp.dest('dist'))
      .pipe($.size({title: 'Copy'}));
});


// Watch Files For Changes & Reload
gulp.task('serve', function () {
  browserSync({
    proxy: "multicolumn.local/dist",
    port: 3001
  });

  // watch for changes
  gulp.watch([
    'site/assets/css/**/*.css',
    'site/assets/js/**/*.js',
    'site/php/*.php'
  ]).on('change', reload);

  gulp.watch('site/assets/css/**/*.scss', ['sass']);
  gulp.watch('site/assets/images/**/*', ['images']);
  gulp.watch('site/*.html', ['html']);
//  gulp.watch('site/assets/js/**/*.js', ['jshint']);
});


gulp.task('resize', function () {
  gulp.src('site/assets/images/*.jpg')
    .pipe(imageResize({ 
      width : 200,
      crop : false,
      upscale : false
    }))
    .pipe(gulp.dest('dist/assets/thumbs/'));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('./site/assets/images/*.jpg')
  .pipe(jpegtran({progressive: true})())
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('./dist/assets/images'))
    .pipe(reload({stream: true, once: true}))
    .pipe($.size({title: 'images'}));
});


// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist']));

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence(['copy', 'js'], cb);
});
