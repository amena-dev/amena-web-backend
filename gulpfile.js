const gulp = require('gulp')
const ts = require('gulp-typescript')
const rimraf = require('rimraf')

const tsProject = ts.createProject('tsconfig.json')
const JSON_FILES = ['./src/*.json', './src/**/*.json']

gulp.task('clean', cb => {
    rimraf('./dist', cb)
})

gulp.task('scripts', gulp.series('clean', () => {
    const tsResult = tsProject.src().pipe(tsProject())
    return tsResult.js.pipe(gulp.dest('dist'))
}))

gulp.task('watch', gulp.series('scripts', () => {
    gulp.watch('./src/**/*.ts', gulp.task('scripts'))
    gulp.watch('./test/**/*.ts', gulp.task('scripts'))
}))

gulp.task('assets', () => {
    return gulp.src(JSON_FILES).pipe(gulp.dest('dist'))
})

gulp.task('serve', gulp.series('watch', 'assets'))
gulp.task('build', gulp.series('scripts', 'assets'))