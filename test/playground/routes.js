var path             = require('path');
var browserNatives   = require('../../lib/index');
var exec             = require('../../lib/utils/exec').exec;
var OS               = require('../../lib/utils/os');
var toAbsPath        = require('../../lib/utils/to-abs-path');
var getViewportSizes = require('../../lib/utils/get-viewport-sizes');


var installations  = {};
var browsers       = [];
var browserCounter = 0;
var port           = null;
var sizes          = [];

function getBrowserById (id) {
    return browsers.filter(function (item) {
        return item.id === id;
    })[0];
}

function runAsyncForBrowser (browserId, response, fn) {
    var browser = getBrowserById(browserId);

    if (browser) {
        fn(browser)
            .catch(function (err) {
                response.statusCode = 500;
                response.end(err.toString());
            });
    }
    else {
        response.statusCode = 500;
        response.end('Browser not found');
    }
}


//API
exports.init = function (appPort) {
    port = appPort;

    return Promise.all([
        browserNatives.getInstallations()
            .then(function (res) {
                installations = res;
            }),
        getViewportSizes('')
            .then(function (res) {
                sizes = res;
            })
    ]);
};

exports.index = function (req, res) {
    res.render('index', {
        installations: installations,
        browsers:      browsers,
        sizes:         sizes
    });
};

exports.open = function (req, res) {
    var browser = {
        pageUrl:     'http://localhost:' + port + '/test-page/' + Date.now(),
        browserInfo: installations[req.body.browser],
        id:          'br-' + browserCounter++,
        name:        req.body.browser
    };

    return browserNatives.open(browser.browserInfo, browser.pageUrl)
        .then(function () {
            browsers.push(browser);
            res.render('browser', { browser: browser, sizes: sizes });
        })
        .catch(function (err) {
            res.statusCode = 500;
            res.end(err.toString());
        });
};

exports.close = function (req, res) {
    function close (browser) {
        return browserNatives.close(browser.pageUrl)
            .then(function () {
                browsers = browsers.filter(function (item) {
                    return item !== browser;
                });
                res.end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, close);
};

exports.resize = function (req, res) {
    function resize (browser) {
        var args = req.body.paramsType === 'width-height' ?
                   [Number(req.body.width), Number(req.body.height)] :
                   [req.body.deviceName, req.body.orientation];

        return browserNatives.resize.apply(browserNatives, [browser.pageUrl].concat(args))
            .then(function () {
                res.end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, resize);
};

exports.takeScreenshot = function (req, res) {
    function screenshot (browser) {
        var screenshotPath = '';

        /*eslint-disable indent*/
        //NOTE: eslint disabled because of the https://github.com/eslint/eslint/issues/2343 issue
        if (req.body.screenshotPath) {
            screenshotPath = path.isAbsolute(req.body.screenshotPath) ?
                             req.body.screenshotPath :
                             toAbsPath(req.body.screenshotPath);
        }
        else
            screenshotPath = toAbsPath('./screenshots/' + browser.id + '.jpg');
        /*eslint-enable indent*/

        return browserNatives.screenshot(browser.pageUrl, screenshotPath)
            .then(function () {
                return exec((OS.mac ? 'open ' : '') + screenshotPath);
            })
            .then(function () {
                res.end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, screenshot);
};

exports.sandboxPage = function (req, res) {
    res.render('test-page', { id: req.params.id });
};

exports.notFound = function (req, res) {
    res.status = 404;
    res.end('Page not found');
};

exports.noCache = function (req, res, next) {
    res.set('cache-control', 'no-cache, no-store, must-revalidate');
    next();
};
