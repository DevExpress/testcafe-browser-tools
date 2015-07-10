var path         = require('path');
var childProcess = require('child_process');
var gulp         = require('gulp');
var babel        = require('gulp-babel');
var eslint       = require('gulp-eslint');
var flatten      = require('gulp-flatten');
var msbuild      = require('gulp-msbuild');
var del          = require('del');
var through      = require('through2');
var Promise      = require('promise');

var exec = Promise.denodeify(childProcess.exec);

// Windows natives
gulp.task('clean-win-natives', function (cb) {
    del('bin/win', cb);
});

gulp.task('build-win-natives', ['clean-win-natives'], function () {
    return gulp
        .src('src/**/*.csproj')
        .pipe(msbuild({
            targets: ['Clean', 'Build']
        }));
});

gulp.task('copy-win-natives', ['build-win-natives'], function () {
    return gulp
        .src('src/**/win/bin/Release/*.exe')
        .pipe(flatten())
        .pipe(gulp.dest('bin/win'));
});

// Mac natives
gulp.task('clean-mac-natives', function (callback) {
    del('bin/mac', callback);
});

gulp.task('build-mac-natives', ['clean-mac-natives'], function () {
    function make (options) {
        return through.obj(function (file, enc, callback) {
            if (file.isNull()) {
                callback(null, file);
                return;
            }

            var dirPath = path.dirname(file.path);

            exec('make -C ' + dirPath, { env: options })
                .then(function () {
                    callback(null, file);
                })
                .catch(function (error) {
                    callback(error);
                });
        });
    }

    return gulp
        .src('src/**/mac/Makefile')
        .pipe(make({
            DEST: path.join(__dirname, 'bin/mac')
        }));
});

gulp.task('copy-mac-natives', ['clean-mac-natives'], function () {
    return gulp
        .src('src/**/mac/*.scpt')
        .pipe(flatten())
        .pipe(gulp.dest('bin/mac'));
});

// General tasks
gulp.task('lint', function () {
    return gulp
        .src([
            'src/**/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean-lib', function (cb) {
    del('lib', cb);
});

gulp.task('build-lib', ['clean-lib'], function () {
    return gulp
        .src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('lib'));
});

gulp.task('build-win', ['build-lib', 'build-win-natives', 'copy-win-natives']);
gulp.task('build-mac', ['build-lib', 'build-mac-natives', 'copy-mac-natives']);
