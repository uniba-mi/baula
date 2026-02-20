FROM gitlab/gitlab-runner:latest
COPY ./cicd.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    docker.io \
    libicu74 \
    docker-compose \
    && rm -rf /var/lib/apt/lists/*
    
# Install Node.js 24.x
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs

# Ensure npm latest
RUN npm install -g npm@11.6.2

# Install Angular CLI
RUN npm install -g @angular/cli@20.3.6

RUN npm install -g typescript
RUN npm install -g retypeapp
# Verify versions
RUN node -v && npm -v && ng version
