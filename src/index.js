const express = require('express')
const path = require('path')
const yaml = require('node-yaml')
const mkSentence = require('./lib/mk-sentence')
const app = express()
const bodyParser = require('body-parser')
const sentenceCase = require('sentence-case')
const port = 3080

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({	extended: true }));
app.set('view engine', 'pug')
app.use(express.static('public'));

function checkToken(_token) {
	var token = ""
	if (config.token) token = config.token;
	if (!token || _token == token)
		return true;
	else
		return false;
}

function resetLastTitle() {
	if (lastTitleCount > 0) {
		lastTitleCount--;
	}
	if (lastTitleCount == 0) {
		lastTitle = "";
	}
}

require('fs').readdirSync(path.join(__dirname, 'notifiers')).forEach(function (file) {
	const name = path.basename(file, '.js')
	module.exports[name] = require(path.join(__dirname, 'notifiers', file));
});

var config;
var lastTitle = "";
var lastTitleCount = 0;

app.get('/', (req, res) => {
	if (!checkToken(req.query.token)) { res.send('failed token\r\n'); return; };
	var notifiers = Object.keys(config.notifiers);
	var buttons = [];
	for (var i = 0; i < notifiers.length; i++) {
		buttons.push({
			"name": notifiers[i],
			"displayName": sentenceCase(notifiers[i]),
			"enabled": config.notifiers[notifiers[i]].enabled
		});
	}
	res.render('_notifiers', {
		title: 'Notifiers',
		message: req.query.message,
		token: config.token,
		buttons: buttons
	})
});

app.post('/', async (req, res) => {
	if (!checkToken(req.query.token)) { res.send('failed token\r\n'); return; };
	var notifiers = Object.keys(config.notifiers);
	for (var i = 0; i < notifiers.length; i++) {
		config.notifiers[notifiers[i]].enabled = false;
	}
	notifiers = Object.keys(req.body);
	for (var i = 0; i < notifiers.length; i++) {
		if (req.body[notifiers[i]] == "true")
			config.notifiers[notifiers[i]].enabled = true;
	}
	res.redirect("/?message=Changes saved.&token="+config.token);
});

app.post('/api/v1', (req, res) => {
	if (!checkToken(req.query.token)) { res.send('failed token\r\n'); return; };
	var data = req.body;
	var title = "";
	var body = "";
	var eventType = mkSentence(data.event.type);
	if (data.event.geofenceId != 0) {
		title = `Traccar - ${data.device.name} - ${data.geofence.name} ${eventType}`
	} else {
		title = `Traccar - ${data.device.name} - ${eventType}`
	}
	var ignore = false;
	if (config.ignore) {
		for (var i = 0; i < config.ignore.length; i++) {
			if (title.includes(config.ignore[i])) {
				ignore = true;
				break;
			}
		}
	}
	if (!ignore) {
		if ("attributes" in data.event) {
			for (var i in data.event.attributes) {
			    if (data.event.attributes.hasOwnProperty(i)) {
				body += mkSentence(i) + ": " + mkSentence(data.event.attributes[i]) + "\r\n"
			    }
			}
		}
		if (data.event.positionId != 0) {
			body += `https://www.google.com/maps/search/?api=1&query=${data.position.latitude},${data.position.longitude}`
		}
		if (body == "") {
			body = "Traccar Report."
		}
		Object.keys(config.notifiers).forEach(function(key) {
			if (config.notifiers[key].enabled) {
				data.type = key;
				if (title == lastTitle)
					data.duplicate = true;
				console.log(JSON.stringify(data));
				if (title != lastTitle) {
					lastTitle = title;
					lastTitleCount++;
					setTimeout(resetLastTitle, 10000);
					module.exports[key](title, body, config.notifiers[key]);
				}
			}
		});
	} else {
		data.ignore = true;
		console.log(JSON.stringify(data));
	}
	res.send('received\r\n');
})

app.listen(port, async (err) => {
 	config = await yaml.readSync('config.yml')
	if (err) {
		return console.error("ERROR", err)
	}
	console.log(`Server is listening on ${port}`)
})
