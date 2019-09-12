const express = require('express')
const path = require('path')
const yaml = require('node-yaml')
const mkSentence = require('./lib/mk-sentence')
const app = express()
const bodyParser = require('body-parser')
const port = 3080

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({	extended: true }));

require('fs').readdirSync(path.join(__dirname, 'notifiers')).forEach(function (file) {
	const name = path.basename(file, '.js')
	module.exports[name] = require(path.join(__dirname, 'notifiers', file));
});

const config = yaml.readSync('config.yml')

app.post('/api/v1', (req, res) => {
	var data = req.body;
	var title = "";
	var body = "";
	var eventType = mkSentence(data.event.type);
	if (data.event.geofenceId != 0) {
		title = `Traccar - ${data.device.name} - ${data.geofence.name} ${eventType}`
	} else {
		title = `Traccar - ${data.device.name} - ${eventType}`
	}
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
	Object.keys(config).forEach(function(key) {
		if (config[key].enabled) {
			data.type = key;
			console.log(JSON.stringify(data));
			module.exports[key](title, body, config[key]);
		}
	});
	res.send('received\r\n');
})

app.listen(port, (err) => {
	if (err) {
		return console.error("ERROR", err)
	}
	console.log(`Server is listening on ${port}`)
})
