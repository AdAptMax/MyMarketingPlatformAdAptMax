# Use official Node.js image as base image
FROM node:16-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other application files to the container
COPY . .

# Expose the port your app will run on
EXPOSE 8080

# Command to start the app
CMD ["npm", "start"]
