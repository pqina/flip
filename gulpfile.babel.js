import gulp from "gulp";
import clean from "gulp-clean";
import header from "gulp-header";
import sassCompiler from 'sass';
import gulpSass from 'gulp-sass';
import cssnano from "gulp-cssnano";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import concat from "gulp-concat";
import rename from "gulp-rename";
import { rollup } from "rollup";
import babel from "@rollup/plugin-babel";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import uglify from "gulp-uglify";
import size from "gulp-size";
import replace from "gulp-replace";
import fs from "fs";

var pkg = JSON.parse(fs.readFileSync('./package.json'));
pkg.year = new Date().getFullYear();

var banner =
  "/*\n" +
  " * <%= pkg.name %> v<%= pkg.version %> - <%= pkg.description %>\n" +
  " * Copyright (c) <%= pkg.year %> <%= pkg.author.name %> - <%= pkg.homepage %>\n" +
  " */\n";

var bannerJS = "/* eslint-disable */\n\n" + banner;

// Initialize sass with the dart-sass compiler
const sass = gulpSass(sassCompiler);

const styles_base = () => {
  return gulp
    .src("./src/sass/*.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: [
            "last 2 versions",
            "Explorer >= 11",
            "iOS >= 8",
            "Android >= 4.0",
          ],
        }),
      ])
    )
    .pipe(header(banner, { pkg }))
    .pipe(rename("tick.view.flip.css"))
    .pipe(gulp.dest("./dist/"))
    .pipe(cssnano({ safe: true }))
    .pipe(header(banner, { pkg }))
    .pipe(rename((path) => {
      path.basename += ".min";
    }))
    .pipe(gulp.dest("./dist/"));
};

const styles_combined = () => {
  return gulp
    .src(["./tick/tick.core.css", "./dist/tick.view.flip.css"])
    .pipe(concat("flip.css"))
    .pipe(gulp.dest("./dist"))
    .pipe(cssnano({ safe: true }))
    .pipe(header(banner, { pkg }))
    .pipe(rename((path) => {
      path.basename += ".min";
    }))
    .pipe(gulp.dest("./dist/"));
};

const scripts_core = async () => {
  const bundle = await rollup({
    input: "./src/js/index.js",
    plugins: [
      babel({
        babelHelpers: 'bundled',
        presets: [["@babel/preset-env", { modules: false }]],
        plugins: [
          "@babel/plugin-transform-object-rest-spread"
        ]
      }),
    ],
  });

  return bundle.write({
    file: "./tmp/tick.view.flip.js",
    format: "cjs",
  });
};

const scripts_wrap = () => {
  return gulp
    .src([
      "./src/wrapper/intro.js",
      "./tmp/tick.view.flip.js",
      "./src/wrapper/outro.js",
    ])
    .pipe(concat("tick.view.flip.wrapped.js"))
    .pipe(gulp.dest("./tmp"));
};

const scripts_variants = () => {
  const lib = fs.readFileSync("./tmp/tick.view.flip.wrapped.js", "utf8");
  return gulp
    .src("src/variants/*")
    .pipe(replace("__LIB__", lib))
    .pipe(replace("__TYPE__", "view"))
    .pipe(replace("__NAME__", "flip"))
    .pipe(header(bannerJS, { pkg }))
    .pipe(gulp.dest("./dist"));
};

const scripts_minify = () => {
  return gulp
    .src(["./dist/tick.view.flip.global.js", "./dist/tick.view.flip.jquery.js"])
    .pipe(uglify())
    .pipe(rename((path) => {
      path.basename += ".min";
    }))
    .pipe(header(bannerJS, { pkg }))
    .pipe(gulp.dest("./dist"));
};

const scripts_combined = () => {
  return gulp
    .src([
      "./tick/tick.core.polyfill.js",
      "./dist/tick.view.flip.global.js",
      "./tick/tick.core.kickstart.js",
    ])
    .pipe(concat("flip.js"))
    .pipe(gulp.dest("./dist"))
    .pipe(uglify())
    .pipe(rename((path) => {
      path.basename += ".min";
    }))
    .pipe(header(bannerJS, { pkg }))
    .pipe(gulp.dest("./dist"));
};

const scripts_clean = () => {
  return gulp.src("./tmp", { read: false, allowEmpty: true }).pipe(clean());
};

const scripts = gulp.series(
  scripts_core,
  scripts_wrap,
  scripts_variants,
  scripts_minify,
  scripts_combined,
  scripts_clean
);

const styles = gulp.series(styles_base, styles_combined);

export const build = gulp.parallel(styles, scripts);
export default gulp.series(build, () => {
  gulp.watch(["./src/**/*", "./tick/*.js"], build);
});
