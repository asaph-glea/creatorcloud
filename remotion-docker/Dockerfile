# Use Node 20 on Debian Bookworm (required for Chrome)
FROM node:20-bookworm

# Install Google Chrome Stable
# Based on Remotion's recommendations for Docker
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Typescript server (if needed) or run directly with ts-node
# For simplicity in this setup, we'll use ts-node via npx or similar
# Better practice: build the server.ts to js. 
# Let's install ts-node globally or use npx
RUN npm install -g ts-node typescript

# Expose port
EXPOSE 8080

# Start command
# Adjust this to point to your server file
CMD ["npx", "ts-node", "remotion-docker/server.ts"]
