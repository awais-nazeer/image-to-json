# =================================================================
# Author: Awais Nazeer (ZRR Gujjar)
# Email: awaisnazeer07@gmail.com
# =================================================================
# Bakery OCR System - Frontend Dockerfile
# =================================================================

# Build stage
FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration to handle React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 