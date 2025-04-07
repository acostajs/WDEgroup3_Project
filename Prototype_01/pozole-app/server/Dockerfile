FROM node:lts-alpine
WORKDIR /app
RUN echo "Current directory before copying package.json:" && ls -al /app
COPY server/package*.json ./
RUN echo "Current directory after copying package.json:" && ls -al /app
RUN npm install --production
COPY server/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]