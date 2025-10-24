# Use the official Debian base image
FROM debian:latest


ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get upgrade -y

# Install common tools and dependencies
RUN apt-get install -y \
    bash-completion \
    vim \
    git \
    sudo \
    cron \
    byobu \
    python3 \
    openssh-server \
    rsync \
    curl \
    locales \
    mycli \
    unattended-upgrades
   
RUN locale-gen de_DE.utf8 && locale -a
    
RUN dpkg-reconfigure -p critical unattended-upgrades

# Install and enable apache2
RUN sudo apt-get update
RUN sudo apt-get install -y apache2 
RUN a2enmod ssl env proxy proxy_http rewrite headers

# Kopieren Sie das Start-Skript in das Container-Dateisystem
COPY start.sh /usr/local/bin/start.sh

# Stellen Sie sicher, dass das Skript ausführbar ist
RUN chmod +x /usr/local/bin/start.sh

# Apache-Template & Entrypoint
COPY apache2/sites-available/000-default.conf.template /etc/apache2/sites-available/000-default.conf.template

# Starten Sie das Start-Skript
ENTRYPOINT ["/usr/local/bin/start.sh"]