# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build arguments
ARG VITE_APP_ID
ARG VITE_AUTH_API_URL

# Set environment variables
ENV VITE_APP_ID=$VITE_APP_ID
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]