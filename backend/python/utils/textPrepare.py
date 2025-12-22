import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from langdetect import detect

# NLTK Ressourcen herunterladen (nur beim ersten Ausführen nötig)
nltk.download('punkt')
nltk.download('stopwords')

class TextPreprocessor:
    def __init__(self):
        """
        Initialisiert die TextPreprocessor-Klasse und lädt die benötigten Sprachmodelle und Ressourcen.

        :return: None
        """
        self.stop_words_de = set(stopwords.words('german'))
        self.stop_words_en = set(stopwords.words('english'))
        self.stop_words_de.update({"m", "w", "d"})
        self.stop_words_en.update({"m", "w", "d"})
        self.lemmatizer = WordNetLemmatizer()

    def cleanhtml(self, raw_html):
        """
        Entfernt HTML-Tags aus dem gegebenen Text.

        :param raw_html: Der HTML-Rohtext, der bereinigt werden soll.
        :return: Der bereinigte Text ohne HTML-Tags.
        """
        CLEANR = re.compile('<.*?>')

        cleantext = re.sub(CLEANR, '', raw_html)
        return cleantext

    def preprocessText(self, text, splitResult):
        """
        Bereinigt und verarbeitet den gegebenen Text durch HTML-Reinigung, Normalisierung,
        Tokenisierung, Stopwortentfernung und Lemmatisierung.

        :param text: Der zu verarbeitende Text.
        :param splitResult: Boolesches Flag, das angibt, ob die Lemmata gesplittet oder als String zurückgegeben werden sollen.
        :return: Eine Liste von Lemmata oder ein String der Lemmata.
        """
        if text.strip():
            lang = detect(text)
            if lang == 'en':
                stop_words = self.stop_words_en
            else:
                stop_words = self.stop_words_de

            text = self.cleanhtml(text)

            # Normalisierung: Kleinbuchstaben und Entfernen unerwünschter Zeichen
            text = text.lower()  # Alles in Kleinbuchstaben
            text = re.sub(r'\W', ' ', text)  # Entferne nicht-alphanumerische Zeichen (außer Leerzeichen)

            # Tokenisierung
            tokens = word_tokenize(text)

            # Stopwortentfernung
            tokens = [token for token in tokens if token not in stop_words]
            # Lemmatisierung
            lemmatized_tokens = [self.lemmatizer.lemmatize(token) for token in tokens]

            if splitResult:
                return lemmatized_tokens
            else:
                return " ".join(lemmatized_tokens)
