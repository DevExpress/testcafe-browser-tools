const childProcess = require('child_process');
const path         = require('path');
const fs           = require('fs');
const util         = require('util');
const zlib         = require('zlib');
const execa        = require('execa');
const gulp         = require('gulp');
const eslint       = require('gulp-eslint');
const flatten      = require('gulp-flatten');
const mocha        = require('gulp-mocha');
const msbuild      = require('gulp-msbuild');
const jsdoc        = require('jsdoc-to-markdown');
const remoteSrc    = require('gulp-remote-src');
const changed      = require('gulp-changed');
const chmod        = require('gulp-chmod');
const del          = require('del');
const through      = require('through2');
const Promise      = require('pinkie');
const { platform } = require('linux-platform-info');
const tmp          = require('tmp');
const tar          = require('tar-stream');
const packageInfo  = require('./package.json');


const EXEC_MASK           = parseInt('111', 8);
const UNIX_BINARY_PATH_RE = /^package\/bin\/(mac|linux)/;

const MACOSX_DEPLOYMENT_TARGET = '10.10';
const MAC_APP_NAME             = 'TestCafe Browser Tools.app';
const MAC_BINARY_PATH          = `bin/mac/${MAC_APP_NAME}/Contents/MacOS`;

const writeFile = util.promisify(fs.writeFile);

tmp.setGracefulCleanup();

function make (options) {
    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            callback(null, file);
            return;
        }

        var dirPath = path.dirname(file.path).replace(/ /g, '\\ ');

        execa('make -C ' + dirPath, { shell: true, env: { ...process.env, ...options } })
            .then(function () {
                callback(null, file);
            })
            .catch(callback);
    });
}

// Windows bin
function cleanWindowsNatives () {
    return del('bin/win');
}

function buildWindowsUtilsDLL () {
    return gulp
        .src('src/natives/**/utils.csproj')
        .pipe(msbuild({
            targets:     ['Clean', 'Build'],
            errorOnFail: true
        }));
}

function buildWindowsExecutables () {
    return gulp
        .src(['!src/natives/**/utils.csproj', 'src/natives/**/*.@(cs|vcx)proj'])
        .pipe(msbuild({
            targets:      ['Clean', 'Build'],
            toolsVersion: 12.0
        }));
}

function copyWindowsExecutables () {
    return gulp
        .src([
            'src/natives/**/@(win|any)/bin/Release/*.dll',
            'src/natives/**/@(win|any)/bin/Release/*.exe',
            'src/natives/**/@(win|any)/bin/Release/*.config'
        ])
        .pipe(flatten())
        .pipe(gulp.dest('bin/win'));
}

// Mac bin
function cleanMacNatives () {
    return del(MAC_BINARY_PATH);
}

function buildMacExecutables () {
    return gulp
        .src('src/natives/!(app)/@(mac|any)/Makefile')
        .pipe(make({
            DEST: 'obj',
            MACOSX_DEPLOYMENT_TARGET
        }));
}

function buildMacApp () {
    return gulp
        .src('src/natives/app/mac/Makefile')
        .pipe(make({
            DEST: path.join(__dirname, MAC_BINARY_PATH),
            MACOSX_DEPLOYMENT_TARGET
        }));
}

// Linux bin
function cleanLinuxNatives () {
    return del(['bin/linux/*.sh', 'bin/linux/' + platform]);
}

function buildLinuxExecutables () {
    return gulp
        .src('src/natives/**/@(linux|any)/Makefile')
        .pipe(make({
            DEST: path.join(__dirname, 'bin/linux', platform)
        }));
}

function copyLinuxScripts () {
    return gulp
        .src('src/natives/**/linux/*.sh')
        .pipe(flatten())
        .pipe(chmod(755))
        .pipe(gulp.dest('bin/linux'));
}

// Test
function runPlayground () {
    require('./test/playground/index');
}

function test () {
    return gulp
        .src('test/tests/*-test.js')
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 2000 : Infinity // NOTE: disable timeouts in debug
        }));
}

// General tasks
function updateDeviceDatabase () {
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
}

function lint () {
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
}

function cleanLib () {
    return del('lib');
}

function transpileLib () {
    return childProcess
        .spawn('npx tsc -p ./src/tsconfig.json', { shell: true, stdio: 'inherit' });
}

// TODO: fix dmd-plugin-async
async function docs () {
    const docsContent = await jsdoc.render({
        files:  'lib/**/*.js',
        plugin: 'dmd-plugin-async'
    });

    await writeFile('API.md', docsContent);
}

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

function publish () {
    var publishArguments    = process.argv.slice(3);
    var packageDir          = __dirname;
    var packageName         = packageInfo.name.replace(/^@/, '').replace('/', '-');
    var tarballName         = packageName + '-' + packageInfo.version + '.tgz';
    var modifiedTarballName = 'modified-' + tarballName;
    var tmpDir              = tmp.dirSync({ unsafeCleanup: true });
    var tarballPath         = path.join(tmpDir.name, tarballName);
    var modifiedTarballPath = path.join(tmpDir.name, modifiedTarballName);

    return execa('npm pack ' + packageDir, { shell: true, env: process.env, cwd: tmpDir.name })
        .then(function () {
            return fixPermissionsInTarball(tarballPath, modifiedTarballPath);
        })
        .then(function () {
            return execa('npm publish ' + modifiedTarballName + ' ' + publishArguments.join(' '), {
                shell: true,
                env:   process.env,
                cwd:   tmpDir.name,
                stdio: 'inherit'
            });
        });
}


exports.updateDeviceDatabase = updateDeviceDatabase;

exports.lint = lint;

exports.buildWindowsNatives = gulp.series(cleanWindowsNatives, buildWindowsUtilsDLL, buildWindowsExecutables, copyWindowsExecutables);
exports.buildMacNatives     = gulp.series(cleanMacNatives, buildMacExecutables, buildMacApp);
exports.buildLinuxNatives   = gulp.series(cleanLinuxNatives, gulp.parallel(buildLinuxExecutables, copyLinuxScripts));

exports.docs = docs;

// TODO: add docs autogeneration
exports.buildLib     = gulp.parallel(exports.lint, gulp.series(cleanLib, transpileLib));
exports.buildWindows = gulp.parallel(exports.buildLib, exports.buildWindowsNatives);
exports.buildMac     = gulp.parallel(exports.buildLib, exports.buildMacNatives);
exports.buildLinux   = gulp.parallel(exports.buildLib, exports.buildLinuxNatives);

exports.runPlayground        = runPlayground;
exports.runPlaygroundWindows = gulp.series(exports.buildWindows, runPlayground);
exports.runPlaygroundMac     = gulp.series(exports.buildMac, runPlayground);
exports.runPlaygroundLinux   = gulp.series(exports.buildLinux, runPlayground);

exports.test = gulp.series(exports.buildLib, test);

exports.publish = publish;
