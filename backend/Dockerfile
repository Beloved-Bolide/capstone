# Stage 1: Build the application and install dependencies
FROM node:24 AS builder
WORKDIR /home/node/app

# Leverage caching by copying package.json and package-lock.json first
COPY package*.json ./
# Use the package manager from the base image; upgrading npm is optional
RUN npm install

# Copy the rest of the application source code
COPY . .


# ----------------------------------------------------------------------
# Stage 2: Production/Runtime Image
FROM node:24
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV
ARG PORT=4200
ENV PORT $PORT
EXPOSE $PORT 9229 9230

WORKDIR /home/node/app

# IMPORTANT: Copy ALL necessary files from the builder stage
# This includes the source code AND the node_modules folder
# The 'builder' stage WORKDIR was /home/node/app, so we copy everything from it.
COPY --from=builder /home/node/app /home/node/app/

# Set ownership for security (good practice)
# Use the correct path for the RUN command (it's often easier to do this before the COPY)
# RUN chown -R node:node /home/node/app

# Switch to the non-root user
USER node

# Run the application
CMD ["npm", "run", "dev"]