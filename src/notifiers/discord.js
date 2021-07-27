const { Webhook } = require('discord-webhook-node');

module.exports = (function (title, body, config) {
    const hook = new Webhook(config.webhook_url);

    hook.setUsername(config.username);
    hook.setAvatar(config.avatar_url);
    
    hook.send(`${title}\r\n${body}`);
});
