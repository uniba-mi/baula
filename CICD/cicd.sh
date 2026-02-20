#!/bin/bash
set -e

# Register runner if config.toml does not exist
if [ ! -f /etc/gitlab-runner/config.toml ]; then
    gitlab-runner register \
        --non-interactive \
        --url https://gitlab.rz.uni-bamberg.de \
        --token glrt-gZoS5W_ZEl4ZqMoewaEvL286MQpwOjZqagp0OjMKdToxenoT.01.1c1tcpz88 \
        --description "Runner-inside-Docker" \
        --executor docker \
        --docker-image ubuntu:22.04
fi

# Start the runner
exec gitlab-runner run --user=gitlab-runner --working-directory=/home/gitlab-runner