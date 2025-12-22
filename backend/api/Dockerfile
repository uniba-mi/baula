# Use an official Node.js runtime as a parent image
FROM node:24

# Install dependencies
RUN apt update && apt install -y \
  vim \
  ca-certificates \
  fonts-liberation\
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \ 
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  xdg-utils \
  wget \
  && rm -rf /var/lib/apt/lists/*

# Add Google Chrome repository and install Chrome
#RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
#  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
#  && apt update \
#  && apt install -y google-chrome-stable

RUN npm install -g pm2@latest

# Kopieren Sie das Start-Skript in das Container-Dateisystem
COPY start.sh /usr/local/bin/start.sh

# Stellen Sie sicher, dass das Skript ausführbar ist
RUN chmod +x /usr/local/bin/start.sh

# Starten Sie das Start-Skript
ENTRYPOINT ["/usr/local/bin/start.sh"]
