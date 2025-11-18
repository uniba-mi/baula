#!/bin/sh
cd /api
npm install
npx puppeteer browsers install chrome

npm run generateDB

pm2 start src/server.js
cd /api/src/shared/utils
pm2 start cron-job.js

tail -f /dev/null