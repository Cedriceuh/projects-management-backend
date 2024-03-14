# Media library

## Prerequisites

- `docker` installed (tested on version 24.0.5)
- `docker-compose` installed (tested on version 2.24.6)

## Installation

Build and start containers:
```bash
docker-compose -f docker-compose.yml up -d --build
```
API should then be accessible from host system at the following URL: `localhost:3000`


## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
