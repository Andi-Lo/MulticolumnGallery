// generated on 2015-01-26 using generator-4dev 0.1.0

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
var gm = require('gulp-gm');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var uncss = require('gulp-uncss');

var site = 'http://www.andreaslorer.de';


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

    //
    .pipe(gulp.dest('./dist/assets/js/'));
}

// uncss
var gulp = require('gulp');
var uncss = require('gulp-uncss');

gulp.task('uncss', function() {
  return gulp.src('site/assets/**/*.css')
    .pipe(concat('main.css'))
    .pipe(uncss({
        html: ['site/index.html'],
        ignore: [
          ".fade",
          ".fade.in",
          ".collapse",
          ".collapse.in",
          ".collapsing",
          ".alert-danger",
          /\.open/
       ]
    }))
    .pipe($.csso())
    .pipe(gulp.dest('./out'));
});

// css styles
gulp.task('styles', function () {
  return gulp.src('site/assets/css/*.scss')
    .pipe($.sass({
      outputStyle: 'nested', // libsass doesn't support expanded yet
      precision: 10,
      includePaths: ['.'],
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe(gulp.dest('dist/assets/css/'));
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('site/assets/js/scripts.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'))
    .pipe(reload({stream: true}));
});


// html
gulp.task('html', ['styles'], function () {
  // var assets = $.useref.assets({searchPath: ['site/assets/**/*/', '.']});

  return gulp.src('site/index.html')
/*    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())*/
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

// minify javascript
gulp.task('js', function () {
    gulp.src('site/assets/js/*.js')
      .pipe(concat('all.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist/assets/js/'))
      .pipe(notify({ message: 'Finished minifying JavaScript'}));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('site/assets/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

// copy all files from /site/
gulp.task('copy', function () {
  return gulp.src([
    'site/**/*',
    '!site/assets/**/*.jpg',
    '!site/assets/js/*.js',
    '!site/assets/css/*.scss',
    '!site/index.html'
    ],{
     dot:true
    }).pipe(gulp.dest('dist'))
      .pipe($.size({title: 'copy'}));
});

// Watch Files For Changes & Reload
gulp.task('serve', function () {
  browserSync({
    proxy: "multicolumn.local/site/"
  });

  // watch for changes
  gulp.watch([
    'site/*.html',
    'site/assets/css/**/*.css',
    'site/assets/js/**/*.js',
    'site/php/*.php'
  ]).on('change', reload);

  gulp.watch('site/assets/css/**/*.scss', ['styles']);
  gulp.watch(['site/assets/images/**/*.jpg'], ['images']);
  gulp.watch(['site/assets/js/**/*.js'], ['jslint']);
});

// resize images
 gulp.task('resize', function () {
  gulp.src('site/assets/images/**/*.jpg')

  .pipe(gm(function (gmfile) {
    return gmfile.resize(300, 198);
  }, {
    imageMagick: true
  }))

  .pipe(gulp.dest('dist/assets/'));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('site/assets/**/*.+(jpg|png)')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      optimizationLevel: 5
    })))
    .pipe(gulp.dest('dist/assets/'))
    .pipe(reload({stream: true, once: true}))
    .pipe($.size({title: 'images'}));
});

// watch task
gulp.task('watch', function () {
    gulp.watch('site/assets/js/**/*.js', ['js']);
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist']));

gulp.task('cleanApp', del.bind(null, ['app']));

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('images', ['html', 'js', 'styles', 'copy'], 'cleanApp', cb);
});

gulp.task('mobile', function () {
    return pagespeed(site, {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }, function (err, data) {
        console.log(data.score);
        console.log(data.pageStats);
    });
});

gulp.task('desktop', function () {
    return pagespeed(site, {
        // key: key
        nokey: 'true',
        strategy: 'desktop',
    }, function (err, data) {
        console.log(data.score);
        console.log(data.pageStats);
    });
});