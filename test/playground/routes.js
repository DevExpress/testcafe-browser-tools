var path           = require('path');
var viewport       = require('viewport-list');
var Promise        = require('promise');
var browserNatives = require('../../lib/index');
var exec           = require('../../lib/utils/exec').exec;
var OS             = require('../../lib/utils/os');
var toAbsPath      = require('../../lib/utils/to-abs-path');


const SIZE_RE = /(\d+)x(\d+)/;


var installationsList = [];
var installations     = null;
var browsers          = [];
var browserCounter    = 0;
var port              = null;
var deviceNames       = [];

var getViewports = Promise.denodeify(viewport);

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

function getDeviceNames () {
    return getViewports([''])
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
    var browser = {
        pageUrl:     'http://localhost:' + port + '/test-page/' + Date.now(),
        browserInfo: installations[req.body.browser],
        id:          'br-' + browserCounter++,
        name:        req.body.browser,
        screenshots: []
    };

    return browserNatives.open(browser.browserInfo, browser.pageUrl)
        .then(function () {
            browsers.push(browser);
            res.locals = { id: browser.id, name: browser.name, deviceNames: deviceNames };
            res.render('browser');
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

        if (req.body.screenshotPath) {
            screenshotPath = path.isAbsolute(req.body.screenshotPath) ?
                             req.body.screenshotPath :
                             toAbsPath(req.body.screenshotPath);
        }
        else
            screenshotPath = toAbsPath('./screenshots/' + browser.id + '.jpg');

        return browserNatives.screenshot(browser.pageUrl, screenshotPath)
            .then(function () {
                var screenshotIsNotAdded = browser.screenshots.filter(function (item) {
                        return item.path === screenshotPath;
                    }).length === 0;

                if (screenshotIsNotAdded) {
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
                res.end();
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

    res.status(404).send('Not found');
};

exports.sandboxPage = function (req, res) {
    res.locals = { id: req.params.id };
    res.render('test-page');
};

exports.notFound = function (req, res) {
    res.status = 404;
    res.end('Page not found');
};

exports.noCache = function (req, res, next) {
    res.set('cache-control', 'no-cache, no-store, must-revalidate');
    next();
};
