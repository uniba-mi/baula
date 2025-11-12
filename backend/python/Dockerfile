FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./


# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libmariadb-dev \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt
#RUN python -m spacy download de_core_news_sm
#RUN python -m spacy download en_core_web_sm
#RUN python -m spacy validate
RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader punkt_tab
RUN python -m nltk.downloader stopwords
RUN python -m nltk.downloader wordnet

COPY . .


EXPOSE 8000

# Set the entrypoint or command to run the application
CMD ["python", "main.py"]