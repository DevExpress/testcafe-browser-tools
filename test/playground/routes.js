const path               = require('path');
const Promise            = require('pinkie');
const { toAbsPath }      = require('read-file-relative').toAbsPath;
const browserTools       = require('../../lib/index');
const { default: delay } = require('../../lib/utils/delay');
const DEVICES            = require('../../data/devices');


const WINDOW_NORMALIZING_DELAY = 1000;

let installationsList = [];
let installations     = null;
let browsers          = [];
let browserCounter    = 0;
let port              = null;
let deviceNames       = [];


function getBrowserById (id) {
    return browsers.filter(function (item) {
        return item.id === id;
    })[0];
}

function runAsyncForBrowser (browserId, response, fn) {
    const browser = getBrowserById(browserId);

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
    return Object.values(DEVICES).map(({ name }) => name);
}

function objectToList (object, keyName) {
    const list = [];

    Object.keys(object).forEach(function (key) {
        const value = object[key];

        value[keyName] = key;

        list.push(value);
    });

    return list;
}

function getRequestedSize (params) {
    if (params.paramsType === 'width-height')
        return { width: Number(params.width), height: Number(params.height) };

    const deviceSize = browserTools.getViewportSize(params.deviceName);

    return params.orientation === 'portrait' ?
        { width: deviceSize.portraitWidth, height: deviceSize.landscapeWidth } :
        { width: deviceSize.landscapeWidth, height: deviceSize.portraitWidth };
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
    const browserId = 'br-' + browserCounter++;
    const browser   = {
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

exports.bringToFront = function (req, res) {
    function bringToFront (browser) {
        return browserTools
            .bringWindowToFront(browser.pageUrl)
            .then(function () {
                res.set('content-type', 'text/plain').end();
            });
    }

    runAsyncForBrowser(req.body.browserId, res, bringToFront);
};

exports.resize = function (req, res) {
    function resize (browser) {
        const requestedSize = getRequestedSize(req.body);

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
        let screenshotPath = '';
        let thumbnailPath  = '';

        if (req.body.screenshotPath) {
            screenshotPath = path.isAbsolute(req.body.screenshotPath) ?
                req.body.screenshotPath :
                toAbsPath(req.body.screenshotPath);
        }
        else
            screenshotPath = toAbsPath('./screenshots/' + browser.id + '.png');

        const cachedScreenshots = browser.screenshots.filter(function (item) {
            return item.path === screenshotPath;
        });

        if (cachedScreenshots.length)
            thumbnailPath = cachedScreenshots[0].thumbnailPath;
        else {
            const screenshotFilename = path.basename(screenshotPath);
            const screenshotDirPath  = path.dirname(screenshotPath);

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
    const imagePath = decodeURIComponent(req.params.path);

    let i = 0;
    let j = 0;

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
