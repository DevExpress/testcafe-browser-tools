var path         = require('path');
var childProcess = require('child_process');
var express      = require('express');
var bodyParser   = require('body-parser');
var routes       = require('./routes');
var OS           = require('../../lib/utils/os');


var PORT = 1334;


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, '/public')));

app.get('/*', routes.noCache);

app.get('/', routes.index);
app.post('/open-browser', routes.openBrowser);
app.post('/close-browser', routes.closeBrowser);
app.post('/take-screenshot', routes.takeScreenshot);
app.get('/test-page/:id', routes.sandboxPage);

app.get('/*', routes.notFound);

routes.init(PORT)
    .then(function () {
        app.listen(PORT);
        childProcess.exec((OS.mac ? 'open ' : 'start ') + 'http://localhost:' + PORT);
    });

