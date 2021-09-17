FROM node:14

WORKDIR /app

COPY ./src ./

RUN yarn

CMD [ "node", "index.js" ]
EXPOSE 80