cd /api/backend
npm install
npx puppeteer browsers install chrome

npm run generateDB

pm2 start pm2.config.js --only api-test
cd /api/backend/src/cron
pm2 start cron-job.js

tail -f /start
