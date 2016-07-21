var path         = require('path');
var childProcess = require('child_process');
var express      = require('express');
var OS           = require('os-family');
var bodyParser   = require('body-parser');
var routes       = require('./routes');


var PORT = 1334;


var app = express();

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
app.post('/update-client-area-size/:id', routes.updateClientAreaSize);

app.get('/*', routes.notFound);

routes.init(PORT)
    .then(function () {
        app.listen(PORT);
        childProcess.exec((OS.mac ? 'open ' : 'start ') + 'http://localhost:' + PORT);
    });

