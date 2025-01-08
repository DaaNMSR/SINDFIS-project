const { src, dest, parallel, series, watch } = require("gulp");
const browserSync = require("browser-sync").create();
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const cleancss = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const del = require("del");

function browsersync() {
  browserSync.init({
    server: { baseDir: "app/" },
    notify: false,
  });
}

function scripts() {
  return src(["app/js/script.js", "!app/**/*.min.js"])
    .pipe(concat("script.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js/"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("app/css/**/*.css", "!app/css/app.min.css")
    .pipe(concat("app.min.css"))
    .pipe(
      autoprefixer({ overrideBrowserslist: ["last 10 version"], grid: true })
    )
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
    .pipe(dest("app/css/"))
    .pipe(browserSync.stream());
}

function images() {
  return src("app/images/src/**/*")
    .pipe(newer("app/images/dist"))
    .pipe(imagemin({ verbose: true }))
    .pipe(dest("app/images/dist"));
}

function cleanimg() {
  return del("app/images/dist/**/*", { force: true });
}

function cleandist() {
  return del("dist/**/*", { force: true });
}

function buildcopy() {
  return src(
    [
      "app/css/**/*.min.css",
      "app/js/**/*.min.js",
      "app/images/dist/**/*",
      "app/**/*.html",
      "app/fonts/**/*",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

function startwatch() {
  watch("app/**/*.html").on("change", browserSync.reload);
  watch("app/scss/main.scss", styles);
  watch(["app/**/*.js", "!app/**/*.min.js"], scripts);
  watch("app/images/src/**/*", images);
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.startwatch = startwatch;
exports.cleanimg = cleanimg;
exports.cleandist = cleandist;
exports.buildcopy = buildcopy;

exports.build = series(cleandist, styles, scripts, images, buildcopy);

exports.default = parallel(styles, scripts, images, browsersync, startwatch);
