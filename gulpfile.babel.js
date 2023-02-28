import autoprefixer from 'autoprefixer';
import fs from 'fs';
import gulp from 'gulp';
import clean from 'gulp-clean';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import header from 'gulp-header';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import size from 'gulp-size';
import uglify from 'gulp-uglify';
import util from 'gulp-util';
import sequence from 'gulp4-run-sequence';
import babel from 'rollup-plugin-babel';
import rollup from 'rollup-stream';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
const sass = require('gulp-sass')(require('sass'));

var pkg = require('./package.json');
pkg.year = new Date().getFullYear();

var banner =
  '/*\n' +
  ' * <%= pkg.name %> v<%= pkg.version %> - <%= pkg.description %>\n' +
  ' * Copyright (c) <%= pkg.year %> <%= pkg.author.name %> - <%= pkg.homepage %>\n' +
  ' */\n';

var bannerJS = '/* eslint-disable */\n\n' + banner;

gulp.task('styles-base', () => {
  return gulp
    .src('./src/sass/*.scss')
    .pipe(sass())
    .on('error', util.log)
    .pipe(postcss([autoprefixer()]))
    .pipe(header(banner, { pkg }))
    .pipe(rename('tick.view.flip.css'))
    .pipe(gulp.dest('./dist/'))
    .pipe(cssnano({ safe: true }))
    .pipe(header(banner, { pkg }))
    .pipe(
      rename(function (path) {
        path.basename += '.min';
      })
    )
    .pipe(gulp.dest('./dist/'));
});

gulp.task('styles-combined', () => {
  return gulp
    .src(['./tick/tick.core.css', './dist/tick.view.flip.css'])
    .pipe(concat('flip.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(cssnano({ safe: true }))
    .pipe(header(banner, { pkg }))
    .pipe(
      rename(function (path) {
        path.basename += '.min';
      })
    )
    .pipe(gulp.dest('./dist/'));
});

gulp.task('scripts-core', () => {
  return rollup({
    input: './src/js/index.js',
    format: 'cjs',
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [['@babel/preset-env', { modules: false }]],
        plugins: [
          '@babel/plugin-syntax-object-rest-spread',
          '@babel/plugin-proposal-object-rest-spread',
        ],
      }),
    ],
  })
    .pipe(source('index.js', './src/js/'))
    .pipe(buffer())
    .pipe(rename('tick.view.flip.js'))
    .pipe(gulp.dest('./tmp'))
    .pipe(uglify().on('error', util.log))
    .pipe(size({ gzip: true }));
});

gulp.task('scripts-wrap', () => {
  // wrap basic version with intro and outro so all classes are contained
  return gulp
    .src([
      // wrapper start
      './src/wrapper/intro.js',

      // lib
      './tmp/tick.view.flip.js',

      // wrapper end
      './src/wrapper/outro.js',
    ])
    .pipe(concat('tick.view.flip.wrapped.js'))
    .pipe(gulp.dest('./tmp'));
});

gulp.task('scripts-variants', () => {
  // read wrapped version of lib
  var lib = fs.readFileSync('./tmp/tick.view.flip.wrapped.js', 'utf8');

  // inject into variants
  return gulp
    .src('src/variants/*')
    .pipe(replace('__LIB__', lib))
    .pipe(replace('__TYPE__', 'view'))
    .pipe(replace('__NAME__', 'flip'))
    .pipe(header(bannerJS, { pkg }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts-minify', () => {
  return gulp
    .src(['./dist/tick.view.flip.global.js', './dist/tick.view.flip.jquery.js'])
    .pipe(uglify().on('error', util.log))
    .pipe(
      rename(function (path) {
        path.basename += '.min';
      })
    )
    .pipe(header(bannerJS, { pkg }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts-combined', () => {
  return gulp
    .src([
      './tick/tick.core.polyfill.js',
      './dist/tick.view.flip.global.js',
      './tick/tick.core.kickstart.js',
    ])
    .pipe(concat('flip.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(uglify().on('error', util.log))
    .pipe(
      rename(function (path) {
        path.basename += '.min';
      })
    )
    .pipe(header(bannerJS, { pkg }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts-clean', () => {
  return gulp.src('./tmp', { read: false }).pipe(clean());
});

gulp.task('update-example', () => {
  return gulp
    .src(['./dist/flip.min.css', './dist/flip.min.js'])
    .pipe(gulp.dest('./example/flip/'));
});

gulp.task('scripts', (cb) => {
  sequence(
    'scripts-core',
    'scripts-wrap',
    'scripts-variants',
    'scripts-minify',
    'scripts-combined',
    'scripts-clean',
    'update-example',
    cb
  );
});

gulp.task('styles', (cb) => {
  sequence('styles-base', 'styles-combined', cb);
});

gulp.task('build', gulp.series('styles', 'scripts'));

gulp.task('default', gulp.series('build'), () => {
  gulp.watch(['./src/**/*', './tick/*.js'], ['build']);
});
