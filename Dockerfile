FROM node:10-alpine
COPY . .
RUN npm install
RUN cd node_modules/puppeteer/.local-chromium/linux-686378 && chown root:root chrome_linux && chmod 4755 chrome_linux
EXPOSE 4000
ENTRYPOINT [ "node", "index.js" ]
