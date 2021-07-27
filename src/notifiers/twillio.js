const twilio = require('twilio');

module.exports = (function (title, body, config) {
	const client = new twilio(config.accountSid, config.authToken);

	client.messages.create({
	  body: `${title}\r\n${body}`,
	  to: config.notif_number,   // Text this number
	  from: config.senderNumber, // From a valid Twilio number
	})
	.then((message) => console.log("Message SID:", message.sid));
});

