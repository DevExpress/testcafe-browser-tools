var path         = require('path');
var viewports    = require('viewportsizes');
var Promise      = require('pinkie');
var browserTools = require('../../lib/index');
var toAbsPath    = require('read-file-relative').toAbsPath;

const WINDOW_NORMALIZING_DELAY = 1000;

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
    return viewports
        .list()
        .filter(function (viewport) {
            return viewport.size.width && viewport.size.height;
        })
        .map(function (viewport) {
            return viewport.name;
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

function getRequestedSize (params) {
    if (params.paramsType === 'width-height')
        return { width: Number(params.width), height: Number(params.height) };

    var deviceSize = browserTools.getViewportSize(params.deviceName);

    return params.orientation === 'portrait' ?
           { width: deviceSize.portraitWidth, height: deviceSize.landscapeWidth } :
           { width: deviceSize.landscapeWidth, height: deviceSize.portraitWidth };
}

function delay (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

// API
exports.init = function (appPort) {
    port        = appPort;
    deviceNames = getDeviceNames();

    return browserTools
        .getInstallations()
        .then(function (res) {
            installations     = res;
            installationsList = objectToList(res, 'name');
        });
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

    // NOTE: We must save the 'browser' structure before we call the 'open' function, because
    // sometimes the browser sends client size information before the 'open' function resolves.
    browsers.push(browser);

    return browserTools
        .open(browser.browserInfo, browser.pageUrl)
        .then(function () {
            res.locals = { id: browser.id, name: browser.name, deviceNames: deviceNames };
            res.render('browser');
        })
        .catch(function (err) {
            browsers.splice(browsers.indexOf(browser), 1);
            res.status(500).set('content-type', 'text/plain').end(err.toString());
        });
};

exports.close = function (req, res) {
    function close (browser) {
        return browserTools
            .close(browser.pageUrl)
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
        var requestedSize = getRequestedSize(req.body);

        function resizeWindow () {
            return browserTools.resize(
                browser.pageUrl,
                browser.clientAreaSize.width,
                browser.clientAreaSize.height,
                requestedSize.width,
                requestedSize.height
            );
        }

        // NOTE: We must resize the window twice if it is maximized.
        // https://github.com/DevExpress/testcafe-browser-tools/issues/71
        return browserTools
            .isMaximized(browser.pageUrl)
            .then(function (maximized) {
                if (!maximized)
                    return null;

                if (!browser.clientAreaSize)
                    throw new Error('Client area size is not found for the browser id-' + browser.id);

                return resizeWindow()
                    .then(function () {
                        return delay(WINDOW_NORMALIZING_DELAY);
                    });
            })
            .then(function () {
                if (!browser.clientAreaSize)
                    throw new Error('Client area size is not found for the browser id-' + browser.id);

                return resizeWindow();
            })
            .then(function () {
                res.set('content-type', 'text/plain').end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, resize);
};

exports.maximize = function (req, res) {
    function maximize (browser) {
        return browserTools
            .maximize(browser.pageUrl)
            .then(function () {
                res.set('content-type', 'text/plain').end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, maximize);
};

exports.takeScreenshot = function (req, res) {
    function screenshot (browser) {
        var screenshotPath = '';
        var thumbnailPath  = '';

        if (req.body.screenshotPath) {
            screenshotPath = path.isAbsolute(req.body.screenshotPath) ?
                             req.body.screenshotPath :
                             toAbsPath(req.body.screenshotPath);
        }
        else
            screenshotPath = toAbsPath('./screenshots/' + browser.id + '.png');

        var cachedScreenshots = browser.screenshots.filter(function (item) {
            return item.path === screenshotPath;
        });

        if (cachedScreenshots.length)
            thumbnailPath = cachedScreenshots[0].thumbnailPath;
        else {
            var screenshotFilename = path.basename(screenshotPath);
            var screenshotDirPath  = path.dirname(screenshotPath);

            thumbnailPath      = path.join(screenshotDirPath, 'thumbnails', screenshotFilename);
        }

        return browserTools
            .screenshot(browser.pageUrl, screenshotPath)
            .then(function () {
                return browserTools.generateThumbnail(screenshotPath, thumbnailPath);
            })
            .then(function () {
                if (!cachedScreenshots.length) {
                    browser.screenshots.push({
                        path:          screenshotPath,
                        thumbnailPath: thumbnailPath,
                        url:           '/get-image/' + encodeURIComponent(screenshotPath),
                        thumbnailUrl:  '/get-image/' + encodeURIComponent(thumbnailPath)
                    });
                }

                res.locals = { screenshots: browser.screenshots };
                res.render('screenshots');
            });
    }

    runAsyncForBrowser(req.body.browserId, res, screenshot);
};

exports.getImage = function (req, res) {
    var imagePath = decodeURIComponent(req.params.path);
    var i              = 0;
    var j              = 0;

    for (i = 0; i < browsers.length; i++) {
        for (j = 0; j < browsers[i].screenshots.length; j++) {
            if (browsers[i].screenshots[j].path === imagePath ||
                browsers[i].screenshots[j].thumbnailPath === imagePath) {
                res.sendfile(imagePath);
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
