FROM node:12
WORKDIR /usr/src/app
COPY . .
EXPOSE 4000
ENTRYPOINT [ "node", "index.js" ]
