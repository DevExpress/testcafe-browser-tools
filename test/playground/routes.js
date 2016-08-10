var path = require('path');
var viewports = require('viewportsizes');
var Promise = require('pinkie');
var browserNatives = require('../../lib/index');
var toAbsPath = require('read-file-relative').toAbsPath;

const WINDOW_NORMALIZING_DELAY = 1000;

var installationsList = [];
var installations = null;
var browsers = {};
var pendingOpenings = {};
var pendingCloses = {};
var browserCounter = 0;
var port = null;
var deviceNames = [];


function getBrowserById (id) {
    return browsers[id];
}

function getBrowserUrl (id) {
    return 'http://localhost:' + port + '/test-page/' + id;
}

function getBrowsersList () {
    return Object
        .keys(browsers)
        .map(function (id) {
            return browsers[id];
        });
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

    var deviceSize = browserNatives.getViewportSize(params.deviceName);

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
exports.browsers = browsers;

exports.init = function (appPort) {
    port = appPort;
    deviceNames = getDeviceNames();

    return browserNatives
        .getInstallations()
        .then(function (res) {
            installations = res;
            installationsList = objectToList(res, 'name');
        });
};

exports.index = function (req, res) {
    res.locals = {
        installationsList: installationsList,
        browsers:          getBrowsersList(),
        deviceNames:       deviceNames
    };

    res.render('index');
};

exports.open = function (req, res) {
    var browserId = req.body.browser + '-' + browserCounter++;

    return browserNatives
        .open(installations[req.body.browser], getBrowserUrl(browserId))
        .then(function () {
            return exports.waitForBrowserOpen(browserId);
        })
        .then(function (browser) {
            res.locals = { id: browser.id, name: browser.name, deviceNames: deviceNames };
            res.render('browser');
        })
        .catch(function (err) {
            res.status(500).set('content-type', 'text/plain').end(err.toString());
        });
};

exports.waitForBrowserOpen = function (id) {
    if (browsers[id])
        return Promise.resolve(browsers[id]);

    var resolver = null;

    pendingOpenings[id] = new Promise(function (resolve) {
        resolver = resolve;
    });

    pendingOpenings[id].resolve = resolver;

    return pendingOpenings[id]
        .then(function (browser) {
            delete pendingOpenings[id];

            return browser;
        });
};

exports.waitForBrowserClose = function (id) {
    if (!browsers[id])
        return Promise.resolve();

    var resolver = null;

    pendingCloses[id] = new Promise(function (resolve) {
        resolver = resolve;
    });

    pendingCloses[id].resolve = resolver;

    return pendingCloses[id]
        .then(function () {
            delete pendingCloses[id];
        });
};

exports.confirmOpen = function (req, res) {
    var browserId = req.params.id;
    var browserName = /^([^-]+)/.exec(browserId)[1];

    var browser = {
        pageUrl:        getBrowserUrl(browserId),
        browserInfo:    installations[browserName],
        id:             browserId,
        name:           browserName,
        screenshots:    [],
        clientAreaSize: null
    };

    browsers[browserId] = browser;

    if (pendingOpenings[browserId])
        pendingOpenings[browserId].resolve(browser);

    res.set('content-type', 'text/plain').end();
};

exports.confirmClose = function (req, res) {
    var browserId = req.params.id;

    setTimeout(function () {
        delete browsers[browserId];

        /* eslint-disable no-console */
        console.log(req.body);
        /* eslint-enable no-console */
        if (pendingCloses[browserId])
            pendingCloses[browserId].resolve();

        res.set('content-type', 'text/plain').end();
    }, 5000);
};

exports.close = function (req, res) {
    function close (browser) {
        return browserNatives
            .close(browser.pageUrl)
            .then(function () {
                return exports.waitForBrowserClose(browser.id);
            })
            .then(function () {
                res.set('content-type', 'text/plain').end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, close);
};

exports.resize = function (req, res) {
    function resize (browser) {
        var requestedSize = getRequestedSize(req.body);

        function resizeWindow () {
            return browserNatives.resize(
                browser.pageUrl,
                browser.clientAreaSize.width,
                browser.clientAreaSize.height,
                requestedSize.width,
                requestedSize.height
            );
        }

        // NOTE: We must resize the window twice if it is maximized.
        // https://github.com/DevExpress/testcafe-browser-natives/issues/71
        return browserNatives
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
        return browserNatives
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
        var thumbnailPath = '';

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
            var screenshotDirPath = path.dirname(screenshotPath);

            thumbnailPath = path.join(screenshotDirPath, 'thumbnails', screenshotFilename);
        }

        return browserNatives
            .screenshot(browser.pageUrl, screenshotPath)
            .then(function () {
                return browserNatives.generateThumbnail(screenshotPath, thumbnailPath);
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

    function searchBrowserForImage (id) {
        return browsers[id].screenshots.some(function (screenshot) {
            return screenshot.path === imagePath ||
                screenshot.thumbnailPath === imagePath;
        });
    }

    if (!Object.keys(browsers).some(searchBrowserForImage))
        res.status(404).set('content-type', 'text/plain').send('Not found');

    res.sendfile(imagePath);
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
