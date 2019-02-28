var gulp = require('gulp')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')

gulp.task('script', function () {
  gulp.src('src/*.js')
      .pipe(uglify())
      .pipe(rename(function (path) {
        path.basename += '.min'
      }))
      .pipe(gulp.dest('dist/'))
})

gulp.task('auto', function () {
  gulp.watch('src/*js', ['script'])
})

gulp.task('default', ['script', 'auto'])