const { expect } = require('chai');
const fs         = require('fs');
const path       = require('path');
const zlib       = require('zlib');
const execa      = require('execa');
const proxyquire = require('proxyquire');
const tar        = require('tar-stream');
const tmp        = require('tmp');
const packageInfo = require('../../package.json');

describe('Publish task', function () {
    this.timeout(30000);

    let temporaryDirectory;
    let packageDirectory;
    let outputDirectory;

    beforeEach(() => {
        temporaryDirectory = tmp.dirSync({ unsafeCleanup: true });
        packageDirectory   = path.join(temporaryDirectory.name, 'package with spaces & shell; metacharacters');
        outputDirectory    = path.join(temporaryDirectory.name, 'output with spaces & shell; metacharacters');

        fs.mkdirSync(path.join(packageDirectory, 'bin', 'linux'), { recursive: true });
        fs.mkdirSync(outputDirectory);
        fs.writeFileSync(path.join(packageDirectory, 'package.json'), JSON.stringify({
            name:    packageInfo.name,
            version: packageInfo.version
        }));
        fs.writeFileSync(path.join(packageDirectory, 'bin', 'linux', 'browser.sh'), '#!/bin/sh\n', { mode: 0o644 });
    });

    afterEach(() => {
        temporaryDirectory.removeCallback();
    });

    function loadPublish (execute) {
        return proxyquire('../../Gulpfile', {
            execa: execute,
            tmp:   { dirSync: () => ({ name: outputDirectory }) }
        }).publish;
    }

    it('Should preserve npm arguments, pack special-character paths, and fix executable permissions', async () => {
        const calls = [];
        const publishArguments = ['--tag', 'next release & literal; value', '--access=public'];
        const publish = loadPublish((file, args, options) => {
            calls.push({ file, args, options });

            if (args[0] === 'pack')
                return execa(file, ['pack', packageDirectory], options);

            return Promise.resolve();
        });
        const originalArguments = process.argv;
        let publishing;

        try {
            process.argv = ['node', 'gulp', 'publish', ...publishArguments];
            publishing   = publish();
        }
        finally {
            process.argv = originalArguments;
        }

        await publishing;

        const tarballName = packageInfo.name + '-' + packageInfo.version + '.tgz';
        const modifiedTarballName = 'modified-' + tarballName;

        expect(calls).to.have.length(2);
        expect(calls[0].file).to.equal('npm');
        expect(calls[0].args).to.deep.equal(['pack', path.resolve(__dirname, '..', '..')]);
        expect(calls[1].file).to.equal('npm');
        expect(calls[1].args).to.deep.equal(['publish', modifiedTarballName, ...publishArguments]);
        expect(calls[1].options.stdio).to.equal('inherit');

        for (const call of calls) {
            expect(call.options.shell).not.to.equal(true);
            expect(call.options.cwd).to.equal(outputDirectory);
            expect(call.options.env).to.equal(process.env);
        }

        const extract = tar.extract();
        const modes = {};

        extract.on('entry', (header, stream, next) => {
            modes[header.name] = header.mode;
            stream.on('end', next);
            stream.resume();
        });

        await new Promise((resolve, reject) => {
            extract.on('finish', resolve);
            extract.on('error', reject);
            extract.end(zlib.gunzipSync(fs.readFileSync(path.join(outputDirectory, modifiedTarballName))));
        });

        expect(modes['package/bin/linux/browser.sh'] & 0o111).to.equal(0o111);
    });

    it('Should propagate npm pack errors without publishing', async () => {
        const failure = new Error('npm pack failed');
        const calls = [];
        const publish = loadPublish((file, args) => {
            calls.push(args);
            return Promise.reject(failure);
        });

        await publish().then(() => {
            throw new Error('Expected npm pack to fail');
        }, error => {
            expect(error).to.equal(failure);
        });

        expect(calls).to.have.length(1);
        expect(calls[0][0]).to.equal('pack');
    });
});
