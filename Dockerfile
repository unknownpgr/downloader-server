FROM node:14 AS frontend
WORKDIR /app
COPY ./frontend/package.json ./
COPY ./frontend/yarn.lock ./
RUN yarn --prod
COPY ./frontend ./
RUN yarn build

FROM node:14
RUN apt update
RUN apt install -y ffmpeg
WORKDIR /app
COPY ./backend/package.json ./
COPY ./backend/yarn.lock ./
RUN yarn --prod
COPY --from=frontend /app/build ./public
COPY ./backend ./
RUN mkdir download
CMD [ "node", "index.js" ]
EXPOSE 80