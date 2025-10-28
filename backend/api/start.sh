#!/bin/sh
cd /api
npm install
npx puppeteer browsers install chrome

npm run generateDB

pm2 start src/app.js
cd /api/src/cron
pm2 start cron-job.js

tail -f /dev/null