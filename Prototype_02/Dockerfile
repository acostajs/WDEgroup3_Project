FROM node:20-slim

ENV NODE_ENV production
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip && rm -rf /var/lib/apt/lists/*
COPY python_scripts/requirements.txt ./python_scripts/requirements.txt

RUN pip3 install --break-system-packages -r python_scripts/requirements.txt

COPY package*.json ./

RUN npm install --production --ignore-scripts --prefer-offline

COPY tsconfig.json ./
COPY src ./src
COPY views ./views 
COPY public ./public
COPY data ./data
COPY python_scripts ./python_scripts 

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]