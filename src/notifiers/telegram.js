const Telegram = require('telegram-bot-api')

module.exports = (function (title, body, config) {
	var t = new Telegram({
		token: config.token
	});
	t.sendMessage({
		chat_id: config.chat_id,
		text: `${title}\r\n${body}`
	});
});

