var path           = require('path');
var getViewports   = require('viewport-list');
var Promise        = require('pinkie');
var OS             = require('os-family');
var browserNatives = require('../../lib/index');
var exec           = require('../../lib/utils/exec').exec;
var toAbsPath      = require('read-file-relative').toAbsPath;


const SIZE_RE = /(\d+)x(\d+)/;


var installationsList = [];
var installations     = null;
var browsers          = [];
var browserCounter    = 0;
var port              = null;
var deviceNames       = [];


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
                response.status(500).set('content-type', 'text/plain').end(err.toString());
            });
    }
    else
        response.status(500).set('content-type', 'text/plain').end('Browser not found');
}

function getDeviceNames () {
    return getViewports()
        .then(function (devices) {
            return devices.map(function (item) {
                return SIZE_RE.test(item.size) ?
                       { deviceName: item.name } :
                       null;
            }).filter(function (item) {
                return item !== null;
            });
        });
}

function objectToList (object, keyName) {
    var list = [];

    Object.keys(object).forEach(function (key) {
        var value = object[key];

        value[keyName] = key;

        list.push(value);
    });

    return list;
}

//API
exports.init = function (appPort) {
    port = appPort;

    return Promise.all([
        browserNatives.getInstallations()
            .then(function (res) {
                installations     = res;
                installationsList = objectToList(res, 'name');
            }),
        getDeviceNames()
            .then(function (res) {
                deviceNames = res;
            })
    ]);
};

exports.index = function (req, res) {
    res.locals = {
        installationsList: installationsList,
        browsers:          browsers,
        deviceNames:       deviceNames
    };

    res.render('index');
};

exports.open = function (req, res) {
    var browserId = 'br-' + browserCounter++;
    var browser   = {
        pageUrl:        'http://localhost:' + port + '/test-page/' + browserId,
        browserInfo:    installations[req.body.browser],
        id:             browserId,
        name:           req.body.browser,
        screenshots:    [],
        clientAreaSize: null
    };

    return browserNatives.open(browser.browserInfo, browser.pageUrl)
        .then(function () {
            browsers.push(browser);
            res.locals = { id: browser.id, name: browser.name, deviceNames: deviceNames };
            res.render('browser');
        })
        .catch(function (err) {
            res.status(500).set('content-type', 'text/plain').end(err.toString());
        });
};

exports.close = function (req, res) {
    function close (browser) {
        return browserNatives.close(browser.pageUrl)
            .then(function () {
                browsers = browsers.filter(function (item) {
                    return item !== browser;
                });

                res.set('content-type', 'text/plain').end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, close);
};

exports.resize = function (req, res) {
    function resize (browser) {
        return Promise.resolve()
            .then(function () {
                if (!browser.clientAreaSize)
                    return Promise.resolve();

                var args = [browser.pageUrl, browser.clientAreaSize.width, browser.clientAreaSize.height];

                if (req.body.paramsType === 'width-height')
                    args = args.concat([Number(req.body.width), Number(req.body.height)]);
                else {
                    var deviceSize = browserNatives.getViewportSize(req.body.deviceName);

                    args = args.concat(
                        req.body.orientation === 'portrait' ?
                        [deviceSize.portraitWidth, deviceSize.landscapeWidth] :
                        [deviceSize.landscapeWidth, deviceSize.portraitWidth]
                    );
                }

                return browserNatives.resize.apply(browserNatives, args);
            })
            .then(function () {
                res.set('content-type', 'text/plain').end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, resize);
};

exports.takeScreenshot = function (req, res) {
    function screenshot (browser) {
        var screenshotPath = '';

        if (req.body.screenshotPath) {
            screenshotPath = path.isAbsolute(req.body.screenshotPath) ?
                             req.body.screenshotPath :
                             toAbsPath(req.body.screenshotPath);
        }
        else
            screenshotPath = toAbsPath('./screenshots/' + browser.id + '.jpg');

        return browserNatives.screenshot(browser.pageUrl, screenshotPath)
            .then(function () {
                var screenshots = browser.screenshots.filter(function (item) {
                    return item.path === screenshotPath;
                });

                if (screenshots.length === 0) {
                    browser.screenshots.push({
                        path: screenshotPath,
                        url:  '/get-screenshot/' + encodeURIComponent(screenshotPath)
                    });
                }

                exec((OS.mac ? 'open ' : '') + screenshotPath);

                res.locals = { screenshots: browser.screenshots };
                res.render('screenshots');
            })
            .catch(function () {
                res.set('content-type', 'text/plain').end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, screenshot);
};

exports.getScreenshot = function (req, res) {
    var screenshotPath = decodeURIComponent(req.params.path);
    var i              = 0;
    var j              = 0;

    for (i = 0; i < browsers.length; i++) {
        for (j = 0; j < browsers[i].screenshots.length; j++) {
            if (browsers[i].screenshots[j].path === screenshotPath) {
                res.sendfile(screenshotPath);
                return;
            }
        }
    }

    res.status(404).set('content-type', 'text/plain').send('Not found');
};

exports.updateClientAreaSize = function (req, res) {
    function updateClientAreaSize (browser) {
        browser.clientAreaSize = {
            width:  Number(req.body.width),
            height: Number(req.body.height)
        };

        res.set('content-type', 'text/plain').end();
        return Promise.resolve();
    }

    runAsyncForBrowser(req.params.id, res, updateClientAreaSize);
};

exports.sandboxPage = function (req, res) {
    res.locals = { id: req.params.id };
    res.render('test-page');
};

exports.notFound = function (req, res) {
    res.status(404).set('content-type', 'text/plain').end('Page not found');
};

exports.noCache = function (req, res, next) {
    res.set('cache-control', 'no-cache, no-store, must-revalidate');
    next();
};
