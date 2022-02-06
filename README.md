# Traccar Notifier

Traccar Notifier is a node app/docker container to enable push notifications from Traccar to multple platforms.

Currently supported platforms:
- Pushover
- Telegram
- Twilio
- Discord Webhooks
- Email

<img src="screenshots/1.jpg" border=1 width=300>

## Usage

To use Traccar Notifier, include the following two lines in your `traccar.xml` file after using the directions from https://hub.docker.com/r/traccar/traccar:
```
    <entry key="event.forward.enable">true</entry>
    <entry key='event.forward.url'>http://traccar-notifier:3080/api/v1</entry>
```

Next, copy the `config.yml` file out of the container:
```
mkdir -p ./traccar-notifier
docker run \
	--rm \
	--entrypoint cat \
	nowsci/traccar-notifier:latest \
	/app/config.yml > ./traccar-notifier/config.yml
```

You will now have a config file like the following, edit the file to your liking, for instance:
``` yml
notifiers:

  pushover:
    enabled: true
    send_lowest_priority_on_disabled: false
    user: fdfa903af04gjdfkadsf93fafjfie9
    token: kafaaf9390efaffslepea09dsf9fkf

  telegram:
    enabled: true
    chat_id: 999999999
    token: 999999999:Afifefaadoieoaaa_aefFEFFDfjadfkaeee

  twilio:
    enabled: true
    accountSid: YBy8uGVuyvuiuyVIuVuyvuiV
    notif_number: +4578467423124
    authToken: BuiBiuoBiubiuB
    senderNumber: +1235522455224

  discord:
    enabled: true
    username: Test
    avatar_url: https://pbs.twimg.com/profile_images/1171753326691717120/lsyv3aU9_400x400.jpg
    webhook_url: https://ptb.discord.com/api/webhooks/8694253322880/PI0V1-8
    
  email:
    enabled: true
    port: 587
    host: mail.example.com
    auth_user: conni@example.com
    auth_pass: Password
    dest_email: conni@example.com

ignore:

token:
```
You can enable more than one notifier, and all that are enabled will fire.

You could also have it ignore any notifications that have a specific string in the title, such as:
``` yml
ignore:
  - Device Online
  - Device Unknown
```

You can also enable a token required on the query string for accessing the system, then access the system via `http://traccar-notifier:3080/api/v1?token=THISISMYTOKEN`
``` yml
token: THISISMYTOKEN
```

Lastly, use the following `docker-compose.yml` file for launching:
```
version: '2'

services:

  traccar:
    image: traccar/traccar
    container_name: traccar
    hostname: traccar
    ports:
      - 80:8082
      - 5000-5150:5000-5150
      - 5000-5150:5000-5150/udp
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - ./traccar/data/logs:/opt/traccar/logs
      - ./traccar/data/database:/opt/traccar/data
      - ./traccar/config/traccar.xml:/opt/traccar/conf/traccar.xml:ro
    restart: always

  traccar-notifier:
    image: nowsci/traccar-notifier
    container_name: traccar-notifier
    volumes:
      - ./traccar-notifier/config.yml:/app/config.yml:ro
    restart: always
```

## Altering configuration via the web
After the system is deployed, you can enable/disable notifiers from `http://traccar-notifier:3080/` via a web browser. This does not change the configuration on disk, just what is in memory.

It is highly recommended to proxy behind SSL with `nginx` or `traefik`.

## Usage outside of Docker
If you wish to use Traccar Notifier outside of docker, then go into the `src` folder, update the `config.yml` then run:
```
npm install
npm start
```

## Adding notifiers
Adding notifiers is accomplished by:
- Adding a new `js` file into the `src/notifiers` folder. The `pushover.js` file can be used as an example.
- Add a relevant configuration section in the `config.yml` file, with `enabled: false` and blank values.

PRs are welcome!

## Getting your Telegram Bot and Chat ID
- Visit https://telegram.me/botfather
- Send the following message to create a bot: `/newbot`
- Use the token in the `config.yml`
- Send a message to your bot to initiate a conversation
- Visit https://telegram.me/get_id_bot
- Send the following message to get your chat id: `/my_id`
- Use the chat ID in the `config.yml`
