'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var minifyHTML = require('gulp-minify-html');
var minifyInline = require('gulp-minify-inline');
var mainBowerFiles = require('main-bower-files');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var concat = require('gulp-concat');

var js_folder = [
	'src/js/modernizr.js',
	'bower_components/jquery/dist/jquery.min.js',
	'bower_components/knockout/dist/knockout.js',
	'src/js/foundation.js',
	'src/js/foundation.topbar.js',
	'src/js/model.js',
	'src/js/app.js'
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
	'src/img/*'
];

gulp.task('minifyhtml', function() {
	return gulp.src(html_folder, { base: 'src/'})
		.pipe(minifyHTML())
		.pipe(minifyInline())
		.pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {
	console.log('Running Sass');
	return gulp.src('src/scss/app.scss')
		.pipe(sass())
		.pipe(uglifycss())
		.pipe(rename('app.min.css'))
		.pipe(gulp.dest('dist/css'));
		//.pipe(browserSync.reload({stream:true}));
});

// Minify JavaScript
gulp.task('minifyjs', function() {
	return gulp.src(js_folder)
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(rename('app.min.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('moveimg', function(){
	return gulp.src(img_folder)
		.pipe(gulp.dest('dist/img'));
});

// Do everything by default
gulp.task('default', ['minifyhtml', 'sass', 'minifyjs', 'moveimg']);

