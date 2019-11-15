const Push = require('pushover-notifications')

module.exports = (function (title, body, config) {
	var p = new Push({
		user: config.user,
		token: config.token
	});
	var msg = {
		message: body,
		title: title,
		sound: 'magic',
		device: 'traccar',
		priority: 0
	}
	p.send(msg, function(err, result) {
		if (err) {
			console.error(err);
		}
	});
});

