FROM node:14

WORKDIR /app

COPY ./ ./

RUN yarn

CMD [ "node", "index.js" ]
EXPOSE 80