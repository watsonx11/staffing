# Use Node.js 20 as the base image
FROM node:20-alpine

# Create app directory in the container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy package.json and pnpm-lock.yaml (if it exists)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"]

