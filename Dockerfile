FROM node:18

# تثبيت مكتبات Chromium
RUN apt-get update && apt-get install -y \
  chromium \
  chromium-driver \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libcups2 \
  libxss1 \
  libgtk-3-0 \
  libxshmfence1 \
  libglu1-mesa \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

CMD ["node", "server.js"]
