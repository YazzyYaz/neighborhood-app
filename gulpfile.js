'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var minifyHTML = require('gulp-minify-html');
var minifyInline = require('gulp-minify-inline');
var mainBowerFiles = require('main-bower-files');

var js_folder = [
	'src/js/*.js',
	'src/views/js/*.js'
];

var html_folder = [
	'src/*.html',
	'src/views/*.html'
];

var css_folder = [
	'src/css/*.css',
	'src/views/css/*.css'
];

var img_folder = [
	'src/img/*.{png,jpg}',
	'src/views/images/*.{png,jpg}'
];

gulp.task('minifyhtml', function() {
  return gulp.src(html_folder, { base: 'src/'})
			.pipe(minifyHTML())
			.pipe(minifyInline())
			.pipe(gulp.dest('dist'));
});

// Minify CSS
gulp.task('minifycss', function() {
  return gulp.src(css_folder, { base: 'src/'})
			.pipe(uglifycss())
			.pipe(gzip())
			.pipe(gulp.dest('dist'));
});

// Minify JavaScript
gulp.task('minifyjs', function() {
  return gulp.src(js_folder, { base: 'src/'})
			.pipe(uglify())
			.pipe(gzip())
			.pipe(gulp.dest('dist'));
});

// Do everything by default
gulp.task('default', ['minifyhtml', 'minifycss', 'minifyjs']);

