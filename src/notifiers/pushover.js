const Push = require('pushover-notifications')

module.exports = (function (title, body, config) {
	var p = new Push({
		user: config.user,
		token: config.token
	});
	var priority = 0;
	if (!config.enabled)
		priority = -2;
	var msg = {
		message: body,
		title: title,
		sound: 'intermission',
		device: 'traccar',
		priority: priority
	}
	p.send(msg, function(err, result) {
		if (err) {
			console.error(err);
		}
	});
});

