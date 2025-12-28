FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy application code
COPY . .

# Start the application
CMD ["node", "index.js"]