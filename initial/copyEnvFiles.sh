#!/bin/bash
export PATH=/usr/bin:/bin:/usr/sbin:/sbin
PATH=/home/baula/envFiles
/usr/bin/cp ./.env $PATH
/usr/bin/cp ./backend/api/environment/.env.backend $PATH
/usr/bin/cp ./backend/api/src/database/.env $PATH/database.env
/usr/bin/cp ./frontend/src/environments/environment.prod.ts $PATH
/usr/bin/cp ./frontend/src/environments/config.prod.ts $PATH
/usr/bin/cp ./backend/api/src/database/redis-users.acl $PATH
/usr/bin/cp ./backend/api/src/templates/student-fn2api.ts $PATH
/usr/bin/cp ./backend/api/src/templates/mhb-fn2mod.ts $PATH
/usr/bin/cp ./backend/api/src/shared/constants/users.ts $PATH
/usr/bin/cp ./backend/api/src/certs/idp_cert.pem $PATH
/usr/bin/cp ./backend/api/src/certs/sp_cert.pem $PATH
/usr/bin/cp ./backend/api/src/certs/sp_key.pem $PATH

