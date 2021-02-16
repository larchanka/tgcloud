const gulp = require('gulp');
const concat = require('gulp-concat');
const concatCss = require('gulp-concat-css');
const gulpCopy = require('gulp-copy');
const cleanDir = require('gulp-clean-dir');
const htmlreplace = require('gulp-html-replace');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
// const cleanCSS = require('gulp-clean-css');
// const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const htmlmin = require('gulp-htmlmin');
 
function scripts() {
  return gulp.src('./public/js/*.js')
    .pipe(cleanDir('./build'))
    .pipe(concat('bundle.js'))
    .pipe(babel({
        plugins: ['@babel/plugin-proposal-class-properties'],
        presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./build/public/js/'));
};

function styles() {
  return gulp.src('./public/css/*.css')
    .pipe(concatCss('bundle.css'))
    .pipe(csso({
        restructure: true,
        sourceMap: true,
        debug: true
    }))
    .pipe(gulp.dest('./build/public/styles/'));
};

function statics() {
    return gulp.src(
        [
            './public/fonts/**.*',
            './public/img/**.*'
        ]
    )
    .pipe(gulpCopy('./build/'))
    .pipe(gulp.dest('./build/'));
}

function finish() {
    return gulp.src(
        './public/index.html',
    )
    .pipe(htmlreplace({
        'css': './styles/bundle.css',
        'js': './js/bundle.js'
    }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulpCopy('./build/'))
    .pipe(gulp.dest('./build/'));
}

exports.default = gulp.series(scripts, styles, statics, finish);
