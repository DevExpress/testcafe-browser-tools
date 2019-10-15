var path         = require('path');
var fs           = require('fs');
var zlib         = require('zlib');
var execa        = require('execa');
var gulp         = require('gulp');
var babel        = require('gulp-babel');
var eslint       = require('gulp-eslint');
var flatten      = require('gulp-flatten');
var mocha        = require('gulp-mocha');
var msbuild      = require('gulp-msbuild');
var concat       = require('gulp-concat');
var jsdoc        = require('gulp-jsdoc-to-markdown');
var remoteSrc    = require('gulp-remote-src');
var changed      = require('gulp-changed');
var chmod        = require('gulp-chmod');
var del          = require('del');
var through      = require('through2');
var Promise      = require('pinkie');
var platform     = require('linux-platform-info').platform;
var tmp          = require('tmp');
var tar          = require('tar-stream');
var packageInfo  = require('./package.json');


const EXEC_MASK           = parseInt('111', 8);
const UNIX_BINARY_PATH_RE = /^package\/bin\/(mac|linux)/;

const MACOSX_DEPLOYMENT_TARGET = '10.14';
const MAC_APP_NAME             = 'TestCafe Browser Tools.app';
const MAC_BINARY_PATH          = `bin/mac/${MAC_APP_NAME}/Contents/MacOS`;

tmp.setGracefulCleanup();

function make (options) {
    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            callback(null, file);
            return;
        }

        var dirPath = path.dirname(file.path).replace(/ /g, '\\ ');

        execa.shell('make -C ' + dirPath, { env: { ...process.env, ...options } })
            .then(function () {
                callback(null, file);
            })
            .catch(callback);
    });
}

// Windows bin
gulp.task('clean-win-bin', function () {
    return del('bin/win');
});

gulp.task('build-win-utils-dll', ['clean-win-bin'], function () {
    return gulp
        .src('src/natives/**/utils.csproj')
        .pipe(msbuild({
            targets:     ['Clean', 'Build'],
            errorOnFail: true
        }));
});

gulp.task('build-win-executables', ['build-win-utils-dll'], function () {
    return gulp
        .src(['!src/natives/**/utils.csproj', 'src/natives/**/*.@(cs|vcx)proj'])
        .pipe(msbuild({
            targets:      ['Clean', 'Build'],
            toolsVersion: 12.0
        }));
});

gulp.task('copy-win-executables', ['build-win-executables'], function () {
    return gulp
        .src([
            'src/natives/**/@(win|any)/bin/Release/*.dll',
            'src/natives/**/@(win|any)/bin/Release/*.exe',
            'src/natives/**/@(win|any)/bin/Release/*.config'
        ])
        .pipe(flatten())
        .pipe(gulp.dest('bin/win'));
});

// Mac bin
gulp.task('clean-mac-bin', function () {
    return del(MAC_BINARY_PATH);
});

gulp.task('build-mac-executables', ['clean-mac-bin'], function () {
    return gulp
        .src('src/natives/!(app)/@(mac|any)/Makefile')
        .pipe(make({
            DEST: 'obj',
            MACOSX_DEPLOYMENT_TARGET
        }));
});

gulp.task('build-mac-app', ['build-mac-executables'], function () {
    return gulp
        .src('src/natives/app/mac/Makefile')
        .pipe(make({
            DEST: path.join(__dirname, MAC_BINARY_PATH),
            MACOSX_DEPLOYMENT_TARGET
        }));
});

// Linux bin
gulp.task('clean-linux-bin', function () {
    return del(['bin/linux/*.sh', 'bin/linux/' + platform]);
});

gulp.task('build-linux-executables', ['clean-linux-bin'], function () {
    return gulp
        .src('src/natives/**/@(linux|any)/Makefile')
        .pipe(make({
            DEST: path.join(__dirname, 'bin/linux', platform)
        }));
});

gulp.task('copy-linux-scripts', ['clean-linux-bin'], function () {
    return gulp
        .src('src/natives/**/linux/*.sh')
        .pipe(flatten())
        .pipe(chmod(755))
        .pipe(gulp.dest('bin/linux'));
});

// Test
gulp.task('run-playground-win', ['build-win'], function () {
    require('./test/playground/index');
});

gulp.task('run-playground-mac', ['build-mac'], function () {
    require('./test/playground/index');
});

gulp.task('run-playground-linux', ['build-linux'], function () {
    require('./test/playground/index');
});

gulp.task('run-playground-no-build', function () {
    require('./test/playground/index');
});

gulp.task('test', ['build-lib'], function () {
    return gulp
        .src('test/tests/*-test.js')
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 2000 : Infinity // NOTE: disable timeouts in debug
        }));
});

// General tasks
gulp.task('update-device-database', function () {
    function transform () {
        return through.obj(function (file, enc, callback) {
            var deviceDatabase = {};

            JSON
                .parse(file.contents.toString())
                .forEach(function (device) {
                    var deviceName     = device['Device Name'];
                    var deviceId       = deviceName.toLowerCase().split(' ').join('');
                    var portraitWidth  = Number(device['Portrait Width']);
                    var landscapeWidth = Number(device['Landscape Width']);

                    if (!isNaN(portraitWidth) && !isNaN(landscapeWidth)) {
                        deviceDatabase[deviceId] = {
                            portraitWidth:  portraitWidth,
                            landscapeWidth: landscapeWidth,
                            name:           deviceName
                        };
                    }
                });

            file.contents = new Buffer(JSON.stringify(deviceDatabase));

            callback(null, file);
        });
    }

    var destDir = 'data/';

    return remoteSrc('devices.json', { base: 'http://viewportsizes.com/' })
        .pipe(transform())
        .pipe(changed(destDir, { hasChanged: changed.compareSha1Digest }))
        .pipe(gulp.dest(destDir));
});

gulp.task('lint', function () {
    return gulp
        .src([
            'src/**/*.js',
            'test/**/*.js',
            '!test/playground/public/**/*',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean-lib', function () {
    return del('lib');
});

gulp.task('transpile-lib', ['clean-lib'], function () {
    return gulp
        .src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('lib'));
});

gulp.task('build-lib', ['transpile-lib', 'docs']);

gulp.task('build-win', ['build-lib', 'copy-win-executables']);
gulp.task('build-mac', ['build-lib', 'build-mac-app']);
gulp.task('build-linux', ['build-lib', 'build-linux-executables', 'copy-linux-scripts']);

gulp.task('docs', ['transpile-lib'], function () {
    var destDir = './';

    return gulp
        .src('lib/**/*.js')
        .pipe(concat('API.md'))
        .pipe(jsdoc({ plugin: 'dmd-plugin-async' }))
        .pipe(changed(destDir, { hasChanged: changed.compareSha1Digest }))
        .pipe(gulp.dest(destDir));
});

function fixPermissionsInTarball (sourceFileName, destinationFileName) {
    var sourceStream      = fs.createReadStream(sourceFileName);
    var destinationStream = fs.createWriteStream(destinationFileName);
    var deflateStream     = zlib.createGunzip();
    var compressStream    = zlib.createGzip();
    var extractStream     = tar.extract();
    var packStream        = tar.pack();

    var resultPromise = new Promise(function (resolve, reject) {
        sourceStream.on('error', reject);
        destinationStream.on('error', reject);
        extractStream.on('error', reject);
        packStream.on('error', reject);
        compressStream.on('error', reject);
        deflateStream.on('error', reject);

        destinationStream.on('finish', resolve);
    });

    extractStream.on('entry', function (header, stream, callback) {
        if (header.name.match(UNIX_BINARY_PATH_RE))
            header.mode |= EXEC_MASK;

        stream.pipe(packStream.entry(header, callback));
    });

    extractStream.on('finish', function () {
        packStream.finalize();
    });

    sourceStream.pipe(deflateStream).pipe(extractStream);

    packStream.pipe(compressStream).pipe(destinationStream);

    return resultPromise;
}

gulp.task('publish', function () {
    var publishArguments    = process.argv.slice(3);
    var packageDir          = __dirname;
    var packageName         = packageInfo.name.replace(/^@/, '').replace('/', '-');
    var tarballName         = packageName + '-' + packageInfo.version + '.tgz';
    var modifiedTarballName = 'modified-' + tarballName;
    var tmpDir              = tmp.dirSync({ unsafeCleanup: true });
    var tarballPath         = path.join(tmpDir.name, tarballName);
    var modifiedTarballPath = path.join(tmpDir.name, modifiedTarballName);

    return execa.shell('npm pack ' + packageDir, { env: process.env, cwd: tmpDir.name })
        .then(function () {
            return fixPermissionsInTarball(tarballPath, modifiedTarballPath);
        })
        .then(function () {
            return execa.shell('npm publish ' + modifiedTarballName + ' ' + publishArguments.join(' '), {
                env:   process.env,
                cwd:   tmpDir.name,
                stdio: 'inherit'
            });
        });
});
