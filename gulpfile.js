/* globals require: false, __dirname */

var gulp = require("gulp");
require('./talk/example-rx/gulpfile.js');


gulp.task('watch', ['watch-example-rx']);


gulp.task('build', ['build-example-rx']);


gulp.task('default', ['build']);
