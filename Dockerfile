FROM node:alpine
MAINTAINER NOSPAM <nospam@nnn.nnn>

WORKDIR /app
COPY src/package*.json ./

RUN npm install && \
    chown node:node /app -R

COPY --chown=node:node src ./

USER node

CMD [ "npm", "start" ]
