/* globals require: false, __dirname */

var babel = require("gulp-babel");
var gulp = require("gulp");
var rename = require("gulp-rename");


gulp.task('build-example-rx-js', function(){
  return gulp.src("talk/example-rx/*.es6.js")
    .pipe(babel())
    .pipe(rename(function(path){
        path.basename = path.basename.replace(/\.es6$/g,"");
    }))
    .pipe(gulp.dest("talk/example-rx/"));
})

gulp.task('watch-example-rx-js', function(){
    return gulp.watch(
        'talk/example-rx/**/*.es6.js',
        ['build-example-rx-js']);
})

gulp.task('watch-example-rx', ['watch-example-rx-js']);

gulp.task('build-example-rx', ['build-example-rx-js']);

