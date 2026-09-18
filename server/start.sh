#!/bin/sh
set -e

# default locale unless provided by the environment
: "${DEFAULT_LOCALE:=de}"
export DEFAULT_LOCALE

# Fill variables into the apache template; the list must stay explicit so that
# Apache's own ${APACHE_LOG_DIR} and friends survive.
envsubst '${HOST_URL} ${HOSTNAME} ${API_PORT} ${DEFAULT_LOCALE}' \
  < /etc/apache2/sites-available/000-default.conf.template \
  > /etc/apache2/sites-available/000-default.conf

# Apache starten
service apache2 start

tail -f /dev/null
