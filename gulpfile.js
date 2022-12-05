'use strict';

const gulp        = require('gulp');
const del         = require("del");
const notify      = require('gulp-notify');
const rename      = require('gulp-rename');
const postcss     = require('gulp-postcss');
const cssnano     = require('gulp-cssnano');
const mqpacker    = require("css-mqpacker");
const svgmin      = require('gulp-svgmin');
const fileinclude = require('gulp-file-include');
const browsersync = require("browser-sync").create();


// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dest'
    },
    host: 'localhost',
    port: 9000,
    open: false,
    notify: false,
    tunnel: false,
    ghostMode: false
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(["./_site/assets/"]);
}

function html() {
  return  gulp.src('./*.html')
    .pipe(fileinclude())
    .on('error', function(){notify('HTML include error');})
    .pipe(gulp.dest('dest/'));
}

function css() {
  var precss  = require('precss');
  var autoprefixer = require('autoprefixer');
  var assets  = require('postcss-assets');
  var perfectionist  = require('perfectionist');
  var browsers = ['last 4 version'];

  var processors = [
    precss(),
    autoprefixer(),
    assets({
      loadPaths: ['img/'],
      basePath: 'dest/',
      relativeTo: 'css/'
    }),
    mqpacker()
  ];

  return gulp.src(['./css/*.css'])
    .pipe(fileinclude())
    .pipe(postcss(processors))
    .on('error', notify.onError({
      title: 'PostCSS Error',
      message: '<%= error.message %>'
    }))
    .pipe(gulp.dest('dest/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano({
      autoprefixer: {browsers: browsers},
      add: true,
      zindex: false
    }))
    .pipe(postcss([
      perfectionist({format:'compact'})
    ]))
    .pipe(gulp.dest('dest/css'))
    .pipe(browsersync.stream());
}

function js() {
  return gulp.src('./js/*.js')
    .pipe(fileinclude())
    .on('error', function(){notify('Javascript include error');})
    .pipe(gulp.dest('dest/js/'))
    .pipe(browsersync.stream());
};

function images() {
  return gulp.src('./img/*.{png,gif,jpg}')
    .pipe(gulp.dest('dest/img/'));
}

function svg() {
  return gulp.src('./img/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest('dest/img/'))
    .pipe(browsersync.stream());
};

// Watch files
function watchFiles() {
  gulp.watch('src/css/**/*.{css,pcss}', css);
  gulp.watch('src/js/**/*.js', js);
  gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
  gulp.watch('src/img/**/*.{png,gif,jpg}', images);
  gulp.watch('src/img/**/*.svg', svg);
}

const build = gulp.parallel(css, images, svg, html, js);
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
