import os
import sys
import re

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Transformer'))
import utils.textPrepare as tp


class SectionEvaluator:
    def __init__(self):
        """
        Initialisiert die SectionEvaluator-Klasse mit vordefinierten wichtigen und weniger wichtigen Überschriften.
        """
        self.tp = tp.TextPreprocessor()

        # Listen für importante und unimportante Überschriften
        self.importante_ueberschriften = [
            'Anforderungen', 'Anforderungsprofil', 'Aufgaben warten auf Sie',
            'DAS BRINGST DU MIT', 'DAS ERWARTET DICH', "Darum geht's",
            'Das bringen Sie mit', 'Das bringst Du mit', 'Das erwartet Dich', 'Das erwartet Sie',
            'Das machst du als Systemadministrator', 'Das sollte Dir Spaß machen',
            'Das werden Sie machen', 'Deine Aufgaben', 'Deine Mission:', 'Der Job',
            'Diese Aufgaben können dich erwarten', 'Diese Herausforderungen übernimmst du',
            'Erfahrungen im Bereich', 'Hauptaufgaben', 'IHR AUFGABENBEREICH',
            'Ihr Profil', 'Ihre Aufgaben', 'Kenntnisse im Bereich',
            'Mit diesen Skills begeisterst du uns', 'Persönliche Kompetenzen',
            'Qualifikationen', 'Qualitfikation', 'Sie bringen mit',
            'Sie sind zuständig für', 'Spannende Aufgaben', 'Tätigkeiten',
            'Voraussetzungen', 'Was Sie bei uns machen', 'Was erwartet Sie',
            'Wir unterstützen', 'Womit du uns überzeugst',
            'Zuständigkeiten', 'aufgaben warten auf dich', 'dein Aufgabenbereich',
            'dein Aufgabengebiet', 'deine Aufgabengebiete', 'dein Profil', 'deine Position', 'erwarten wir',
            'ihr aufgabengebiet', 'ihre aufgabengebiete', 'mitbringen müssen', 'mitbringen solltest',
            'persönliche FähigkeitenAufgabenschwerpunkte', 'sollten Sie mitbringen',
            'solltest du mitbringen', 'verstehen Sie es', 'was sie erwartet',
            'wir erwarten', 'zeichnet dich aus', 'Ihr Know-How', 'Dein neuer Job',
            'unsere Anfroderungen', 'Wer Sie sind', 'Wünschenswert', 'folgende Skills'
        ]

        self.unimportante_ueberschriften = [
            'Arbeitsort', 'Attraktive Bedingungen', 'bieten wir',
            'Bei uns inklusive', 'Benefits', 'Dafür steht',
            'Das dürfen Sie erwarten', 'Das erwartet dich bei uns',
            'Das gibt es für Dich', 'Datenschutzhinweis', 'Deine Benefits',
            'Entdecke die fantastischen Benefits, die auf Dich warten',
            'Gute Gründe, um ins Team zu kommen', 'Haben wir Ihr Interesse geweckt?',
            'Ihr Partner', 'Ihre Bewerbung', 'Kontakt', 'Kontakt und Informationen',
            'Satte Rabatte', 'Sie haben noch Fragen', 'Standort', 'Unser Angebot',
            'Vorteile', 'Warum gerade wir', 'Was wir Dir bieten',
            'Was wir Ihnen bieten können', 'Weitere Hinweise', 'Wir bieten',
            'Wir ihnen bieten', 'von uns', 'warum wir', 'wissen solltest',
            'Über', 'Interessiert?', 'Warum zu', 'Ihre Perspektiven',
            'wir garentieren', 'Wir freuen uns',
        ]

    def evaluateSection(self, text, dev=False, relevance='all'):
        """
        Bewertet die Abschnitte eines gegebenen Textes basierend auf vordefinierten wichtigen und weniger wichtigen Überschriften.

        :param text: Der zu bewertende Text, in dem die Abschnitte analysiert werden sollen.
        :param dev: Ein boolesches Flag, das angibt, ob die Entwicklungsversion von Markierungen verwendet werden soll.
        :param relevance: Gibt die Relevanz der zurückgegebenen Abschnitte an ('unimportant', oder 'all').
        :return: Ein zusammengefasster String der bewerteten Abschnitte mit Kennzeichnungen für wichtige und weniger wichtige Abschnitte.
        """
        print("start: evaluateSection")
        # Aufteilen des Textes in Zeilen
        lines = re.split(r'[\n\t]', text)
        previousRelevance = None  # True = important, False = unimportant
        # Filtern der Absätze
        result_lines = []
        for n in range(len(lines)):
            # Entfernen von Leerzeichen am Anfang und Ende
            absatz_stripped = lines[n].strip()

            if absatz_stripped == "":
                # Wenn der Absatz leer oder zu lange ist, überspringen
                continue

            unimportant_named = False
            # Überprüfen auf unimportante Überschriften und deren Markierung
            for ue in self.unimportante_ueberschriften:
                if ue.lower() in absatz_stripped.lower():
                    if dev:
                        absatz_stripped = absatz_stripped.replace(ue, f"*{ue}*")
                    unimportant_named = True
                    break

            if unimportant_named and (relevance == 'all' or relevance == 'unimportant'):
                if relevance == 'all':
                    result_lines.append('-')
                result_lines.append(absatz_stripped)
                previousRelevance = False

            important_named = False
            # Überprüfen auf importante Überschriften und deren Markierung
            for ue in self.importante_ueberschriften:
                if ue.lower() in absatz_stripped.lower() and len(absatz_stripped) < 100:
                    if dev:
                        absatz_stripped = absatz_stripped.replace(ue, f"*{ue}*")
                    important_named = True
                    break

            if important_named and (relevance == 'all' or relevance == 'important'):
                # Wenn eine importante Überschrift gefunden wird
                if relevance == 'all':
                    result_lines.append('+')  # Füge einen leeren Absatz hinzu
                result_lines.append(absatz_stripped)
                previousRelevance = True

            if not unimportant_named and not important_named:
                if previousRelevance and (
                        relevance == 'important' or relevance == 'all'):  # Wenn der vorherige Absatz important war
                    result_lines.append(absatz_stripped)
                elif not previousRelevance and (
                        relevance == 'unimportant' or relevance == 'all'):  # Wenn der vorherige Absatz unimportant war
                    result_lines.append(absatz_stripped)
                elif previousRelevance == None and relevance == 'all':  # Wenn der erste Absatz weder important noch unimportant war
                    result_lines.append(absatz_stripped)

        result_string = '\n'.join(result_lines)

        return result_string
