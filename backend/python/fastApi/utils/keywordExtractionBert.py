from keybert import KeyBERT
from nltk.corpus import stopwords
import re


german_stop_words = stopwords.words('german')

kw_model = KeyBERT()

custom_stopwords = [
    "verantwortlich", "team", "projekt", "abgeschlossen",
    "tritt", "möglich", "zug", "bereits", "durchführen",
    "arbeiten", "und", "oder", "beziehungsweise", "sowie",
    "arbeitszeiten", "arbeitszeit", "arbeitsweise", "aufgaben", "tätigkeiten", "anforderungen",
    "fähigkeiten", "erfahrungen", "kenntnisse", "aufgabenbereich",
    "verantwortlichkeiten", "verantwortungsbereich", "verantwortung",
    "arbeitsvertrag", "arbeitsverhältnis", "aufgabenstellung",
    "arbeitnehmerüberlassung", "bezahlung", "herausforderung",
    "herausforderungen", "tätigkeit", "tätigkeitsbereich",
    "personalabteilung", "personalabteilungen", "personaldienstleister",
    "personalvermittlung", "qualifikation", "beschäftigung", "berufsanfänger",
    "berufserfahrung", "berufserfahrungen", "berufseinsteiger", "berufstätigkeit",
    "mitarbeitern", "mitarbeiter", "mitarbeiterin", "mitarbeiterinnen", "mitarbeiterinnen",
    "betriebszugehörigkeit", "betriebszugehörigkeiten", "betriebszugehörigkeit",
    "leistungsgerechte", "bereich", "bereiche", "abteilung", "abteilungen",
    "kunden", "endkunden", "bewerben", "bewerbung", "bewerbungen",
    "weiterbildung", "qualifizieren", "angebot", "berufsorientiert", "unterstützt",
    "erfahrung", "jahren", "verfolgen", "vision", "reicht", "berufsorientierung", "unterstützen",
    "angeboten", "beruflich", "grundqualifikation", "renommiertesten", "unternehmen", "bildungsunternehmen",
    "berufliche", "beruflichen", "entwicklungsmöglichkeiten", "weiterbildungs", "selbstständig","selbstständige",
    "strukturiert", "strukturierte", "weiterentwicklung", "vielfältige", "vielfältigen", "vielfältiger",
    "verantwortungsvolle", "verantwortungsvollen", "abwechslungsreiche", "abwechslungsreichen",
    "zukunftsorientierte", "zukunftsorientierten", "zukunftsorientiertes", "lebenslanges", "lebenslangen",
    "zuständig", "zuständige", "zuständigen", "zuständiges", "zuständigkeit", "zuständigkeiten",
    "eingliederung", "fort", "berufsleben", "entscheidungswege", "entscheidungswegen", "entscheidungsweg",
    "entscheidungsfreude", "entscheidungsfreudige", "entscheidungsfreudigen", "entscheidungsfreudiges",
    "entscheidungsfreudig", "entscheidungsfreudigkeit", "entscheidungsfreudigem", "entscheidungsfreudiger",
    "bildungsangebot", "bildungsangebote", "befristung", "befristungen", "befristet", "befristete",
    "leistungswartunge", "leistungswartungen", "leistungswartung", "einkaufsvergünstigen", "einkaufsvergünstigungen",
    "m", "w", "d"
]

# Kombinierte Liste von Stoppwörtern
combined_stopwords = list(german_stop_words) + custom_stopwords

def keywordExtraction(text: str, preprocess, top_n: int = 5):
    """
    Extrahiert Schlüsselwörter aus einem gegebenen Text.

    :param text: Der zu analysierende Text, aus dem Schlüsselwörter extrahiert werden sollen.
    :param preprocess: Boolesches Flag, das angibt, ob der Text vor der Schlüsselwortextraktion vorkonfiguriert werden soll oder nicht.
    :param top_n: Die maximale Anzahl von Schlüsselwörtern, die zurückgegeben werden sollen (default: 5).
    :return: Ein Komma-getrennter String von extrahierten Schlüsselwörtern.
    """
    if text:
        print("start: keywordExtraction")

        # Splitten des Texts basierend auf '.', '!', '?' und Zeilenumbrüchen
        if preprocess:
            all_keywords = re.split(' ', text)
        else:
            split_text = re.split(r'[.!?\n]', text)

            # Entfernen von leeren Strings, die durch aufeinanderfolgende Trennzeichen entstehen können
            split_text = [sentence.strip() for sentence in split_text if sentence.strip()]

            all_keywords = []

            for sentence in split_text:
                keyword = keywordCalculation(sentence)
                if keyword:
                    all_keywords.append(keyword[0][0])


        unique_keywords = list(set(all_keywords))

        final_keywords = keywordCalculation(', '.join(unique_keywords), top_n=top_n)
        keywords_string = [k[0] for k in final_keywords]
        return keywords_string
    else:
        print("No text to extract keywords from")
        return ''

def keywordCalculation(text: str, top_n: int = 1):
    """
    Berechnet die Schlüsselwörter für den gegebenen Text mithilfe des KeyBERT-Modells.

    :param text: Der Text, für den die Schlüsselwörter berechnet werden sollen.
    :param top_n: Die maximale Anzahl von Schlüsselwörtern, die zurückgegeben werden sollen (default: 1).
    :return: Eine Liste der ermittelten Schlüsselwörter.
    """
    keyword = kw_model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 1),
        top_n=top_n,
        stop_words=combined_stopwords
    )
    return keyword
