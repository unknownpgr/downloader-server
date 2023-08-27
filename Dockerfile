FROM node:18 AS frontend
WORKDIR /app
COPY ./frontend/package.json ./
COPY ./frontend/yarn.lock ./
RUN yarn
COPY ./frontend ./
RUN yarn build

FROM node:18
RUN apt update
RUN apt install -y ffmpeg
WORKDIR /app
COPY ./backend/package.json ./
COPY ./backend/yarn.lock ./
RUN yarn --prod
COPY --from=frontend /app/dist ./public
COPY ./backend ./
RUN mkdir download
CMD [ "node", "index.js" ]
EXPOSE 80