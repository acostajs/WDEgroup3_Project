FROM node:20-slim

ENV NODE_ENV production # Set default environment (can be overridden)
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

COPY package*.json ./
RUN npm install --production --ignore-scripts --prefer-offline

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip && rm -rf /var/lib/apt/lists/*

COPY python_scripts/requirements.txt ./python_scripts/requirements.txt

RUN pip3 install --no-cache-dir --break-system-packages -r python_scripts/requirements.txt

COPY . .

COPY tsconfig.json ./

RUN npm run build # Compile TS to JS in /app/dist/

EXPOSE 3000

CMD ["node", "dist/index.js"]