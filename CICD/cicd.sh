#!/bin/bash
set -e

# Register runner if config.toml does not exist
if [ ! -f /etc/gitlab-runner/config.toml ]; then
    gitlab-runner register \
        --non-interactive \
        --url https://gitlab.rz.uni-bamberg.de \
        --token glrt-zu-oVX90-Mnu_aB8iZlGU286MQpwOjZqagp0OjMKdToxenoT.01.1c0brv6ms \
        --description "Runner-inside-Docker" \
        --executor shell
fi

export PATH=$PATH:/usr/local/bin


# Start the runner
exec gitlab-runner run --user=root --working-directory=/home/gitlab-runner