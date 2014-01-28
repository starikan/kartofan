// http://markgoodyear.com/2014/01/getting-started-with-gulp/

var gulp = require('gulp');
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();

gulp.task('scripts', function() {
  return gulp.src('source/js/*.js')
    // .pipe(jshint('.jshintrc'))
    // .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dev/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('production/js'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Scripts task complete' }));
});    

gulp.task('clean', function() {
  return gulp.src(['dev', 'production'], {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    gulp.run('scripts');
});