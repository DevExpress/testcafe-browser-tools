var path         = require('path');
var childProcess = require('child_process');
var express      = require('express');
var OS           = require('os-family');
var bodyParser   = require('body-parser');
var routes       = require('./routes');


var PORT = 1334;


var app = express();

var server = null;

var sockets = {};

var socketId = 0;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');
app.set('partials', {
    browser:       'browser',
    browsers:      'browsers',
    installations: 'installations',
    screenshots:   'screenshots'
});
app.engine('mustache', require('hogan-express'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '/public')));

app.get('/*', routes.noCache);

app.get('/', routes.index);
app.post('/open', routes.open);
app.post('/close', routes.close);
app.post('/resize', routes.resize);
app.post('/maximize', routes.maximize);
app.post('/take-screenshot', routes.takeScreenshot);
app.get('/get-image/:path', routes.getImage);
app.get('/test-page/:id', routes.sandboxPage);
app.post('/confirm-open/:id', routes.confirmOpen);
app.post('/confirm-close/:id', routes.confirmClose);
app.post('/update-client-area-size/:id', routes.updateClientAreaSize);

app.get('/*', routes.notFound);

exports.browsers            = routes.browsers;
exports.waitForBrowserOpen  = routes.waitForBrowserOpen;
exports.waitForBrowserClose = routes.waitForBrowserClose;

exports.start = function (options) {
    if (!options)
        options = {};

    return routes.init(PORT)
        .then(function () {
            server = app.listen(PORT);

            server.on('connection', function (socket) {
                var newSocketId = socketId++;

                sockets[newSocketId] = socket;

                socket.on('close', function () {
                    delete socket[newSocketId];
                });
            });

            if (options.silent)
                return;

            var openURLCommand = '';

            if (OS.win)
                openURLCommand = 'start';
            else if (OS.mac)
                openURLCommand = 'open';
            else
                openURLCommand = 'xdg-open';

            childProcess.exec(openURLCommand + ' http://localhost:' + PORT);
        });
};

exports.stop = function () {
    return new Promise(function (resolve) {
        server.close(resolve);

        Object.keys(sockets).forEach(function (sockId) {
            sockets[sockId].destroy();

            delete sockets[sockId];
        });
    });
};

