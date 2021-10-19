FROM node:14 AS frontend
WORKDIR /app
COPY ./frontend ./
RUN yarn build

FROM node:14
WORKDIR /app
COPY ./backend ./
COPY --from=frontend /app/build ./public
RUN yarn
CMD [ "node", "index.js" ]
EXPOSE 80