# Stage 1: Build the application
FROM node:24 AS builder
WORKDIR /home/node/app

# Leverage caching by copying package.json and package-lock.json first
COPY package*.json ./
RUN npm install -g npm@latest && npm install



FROM node:24
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV
ARG PORT=4200
ENV PORT $PORT
EXPOSE $PORT 9229 9230

WORKDIR /home/node/app
RUN npm install -g npm@latest

# Copy node_modules and package files from builder
COPY --from=builder /home/node/app ./

# Copy additional config files
COPY tsconfig.json ./
COPY resolve-extensions-loader.mjs ./

# Change ownership of everything to node user
RUN chown -R node:node /home/node/app

USER node
CMD ["npm", "run", "dev"]