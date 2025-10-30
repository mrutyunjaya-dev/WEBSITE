#!/bin/sh

cd /app

npm install

# You can manually also run from inside container once.
# npx sequelize-cli db:migrate

pm2-runtime server.js
