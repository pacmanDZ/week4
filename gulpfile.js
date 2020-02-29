var del = require('del');
var { watch, src, dest, parallel, series } = require('gulp');
var browserSync = require('browser-sync');
var twig = require('gulp-twig');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var webpack = require('webpack-stream');

function clearBuild() {
  return del('build/');
}

function devServer(cb) {
  var params = {
    watch: true,
    reloadDebounce: 150,
    notify: false,
    server: { baseDir: './build' },
  };

  browserSync.create().init(params);
  cb();
}


function buildPages() {
  // Пути можно передавать массивами
  return src(['src/pages/*.twig', 'src/pages/*.html'])
    .pipe(twig())
    .pipe(dest('build/'));
}

function buildStyles() {
  return src('src/styles/*.scss')
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      cssnano()
    ]))
    .pipe(dest('build/styles/'));
}

function buildScripts() {
  return src('src/scripts/index.js')
    .pipe(webpack({ output: { filename: 'bundle.js' } }))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(dest('build/scripts/'));
}


function buildAssets(cb) {
  src(['src/assets/**/*.*', '!src/assets/img/**/*.*'])
    .pipe(dest('build/assets/'));

  src('src/assets/img/**/*.*')
    .pipe(imagemin())
    .pipe(dest('build/assets/img'));

}

function buildSomething() {
   return src('src/pages/*.html')
     .pipe(plumber({ errorHandler }))
     .pipe(someTransformation())
     .pipe(anotherTransformation())
     .pipe(dest('build/'));
}

function errorHandler(errors) {
  console.warn('Error!');
  console.warn(errors);
}


function watchFiles() {
  watch(['src/pages/*.twig', 'src/pages/*.html'], buildPages);
  watch('src/styles/*.css', buildStyles);
  watch('src/styles/*.scss', buildStyles);
  watch('src/scripts/**/*.js', buildScripts);
  watch('src/assets/**/*.*', buildAssets);
}


exports.default =
  series(
    clearBuild,
    parallel(
      devServer,
        parallel(buildPages, buildStyles, buildScripts, buildAssets),
        watchFiles
    )
  );
