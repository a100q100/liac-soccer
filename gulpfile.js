var gulp        = require('gulp');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var minify      = require('gulp-minify-css');
var connect     = require('gulp-connect');
var del         = require('del');
var exec        = require('child_process').exec;
var merge       = require('merge-stream');
var builder     = require('nw-builder');



var vendor_js = [
  'bower_components/EaselJS/lib/easeljs-0.8.1.min.js',
  'bower_components/TweenJS/lib/tweenjs-0.6.1.min.js',
  'bower_components/jquery/dist/jquery.min.js',
  'bower_components/bootstrap/dist/js/bootstrap.min.js',
  'bower_components/stats.js/build/stats.min.js',
  'src/assets/js/**/*.js',
];
var vendor_css = [
  'bower_components/bootstrap/dist/css/bootstrap.min.css',
  'bower_components/font-awesome/css/font-awesome.min.css',
];
var vendor_fonts = [
  'bower_components/font-awesome/fonts/*',
];

var app_js = [
  'src/soccer/main.js',
  'src/soccer/**/*.js',
];
var app_css = [
  'src/assets/css/**/*.css'
];
var app_html = [
  'src/index.html'
];
var app_data = [
  'src/*.json'
];

var build_platforms = ['win32'];//, 'linux32', 'osx32'];

// VENDOR =====================================================================
gulp.task('_vendor_js', function() {
  return gulp.src(vendor_js)
             .pipe(uglify())
             .pipe(concat('vendor.min.js'))
             .pipe(gulp.dest('build/js'))
});

gulp.task('_vendor_css', function() {
  return gulp.src(vendor_css)
             .pipe(minify())
             .pipe(concat('vendor.min.css'))
             .pipe(gulp.dest('build/css'))
});

gulp.task('_vendor_fonts', function() {
  return gulp.src(vendor_fonts)
             .pipe(gulp.dest('build/fonts'))
});

gulp.task('_vendor', ['_vendor_js', '_vendor_css', '_vendor_fonts']);


// APP ========================================================================
gulp.task('_app_js', function() {
  return gulp.src(app_js)
             .pipe(uglify())
             .pipe(concat('app.min.js'))
             .pipe(gulp.dest('build/js'))
             .pipe(connect.reload())
});

gulp.task('_app_css', function() {
  return gulp.src(app_css)
             .pipe(minify())
             .pipe(concat('app.min.css'))
             .pipe(gulp.dest('build/css'))
             .pipe(connect.reload())
});

gulp.task('_app_html', function() {
  return gulp.src(app_html)
             .pipe(gulp.dest('build'))
             .pipe(connect.reload())
});

gulp.task('_app_data', function() {
  return gulp.src(app_data)
             .pipe(gulp.dest('build'))
             .pipe(connect.reload())
});

gulp.task('_app', ['_app_js', '_app_css', '_app_html']);


// LIVE RELOAD ================================================================
gulp.task('_livereload', function() {
  connect.server({
    livereload: true,
    port: 8000,
    root: 'build'
  });
});

gulp.task('_watch', function() {
  gulp.watch(app_js, ['_app_js']);
  gulp.watch(app_css, ['_app_css']);
  gulp.watch(app_html, ['_app_html']);
});


// NODE WEBKIT ================================================================
gulp.task('_nw', ['build'], function() {
  exec('nw', '.');
});

gulp.task('_create_cache', ['build'], function() {
  return merge(
    gulp.src(['package.json', 'config.json'])
        .pipe(gulp.dest('cache')),

    gulp.src(['node_modules/socket.io/**/*'])
        .pipe(gulp.dest('cache/node_modules/socket.io')),

    gulp.src(['build/**/*'])
        .pipe(gulp.dest('cache/build'))
  )
});

gulp.task('_dist', ['_create_cache'], function() {
  exec('nwbuild -o dist/ -p '+build_platforms.join(',')+' -v 0.12.2 cache');
  // var nw = new builder({
  //   files     : './cache/**/*',
  //   version   : '0.12.2',
  //   platforms : ['win32'],
  //   cacheDir  : './__cache__',
  //   buildDir  : 'dist',
  //   macIcns   : './src/assets/ball.icns',
  //   winIco    : './src/assets/ball.ico',
  // });

  // nw.build().then(function () {
  //   console.log('all done!');
  // }).catch(function (error) {
  //   console.error(error);
  // });
});


// COMMANDS ===================================================================
gulp.task('build', ['_vendor', '_app']);
gulp.task('serve', ['build', '_livereload', '_watch']);
gulp.task('nw', ['_nw']);
gulp.task('dist', ['_dist'])