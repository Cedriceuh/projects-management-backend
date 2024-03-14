FROM node:21.7.1-alpine as development

ENV NODE_ENV=development

RUN mkdir -p /app/dist
RUN chown -R node:node /app

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

CMD ["npm", "run", "start:dev"]

FROM node:21.7.1-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY --from=development /app/node_modules ./node_modules
COPY . .

RUN npm run build

ENV NODE_ENV=production

RUN npm ci --only=production && npm cache clean --force

FROM node:21.7.1-alpine as production

ENV NODE_ENV=production

RUN mkdir -p /app/dist
RUN chown -R node:node /app

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

USER node

CMD ["npm", "run", "start:prod"]