#!/bin/sh
set -e

# Variablen in Apache-Template einfügen
envsubst < /etc/apache2/sites-available/000-default.conf.template > /etc/apache2/sites-available/000-default.conf

# Apache starten
service apache2 start

tail -f /dev/null
