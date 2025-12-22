import csv
from datetime import datetime


def writeResultLog(result, csv_filename, title, description, info_df, limit):
    """
    Schreibt das Ergebnisprotokoll in eine CSV-Datei.

    :param result: Das Ergebnis-Datenformat (DataFrame), das protokolliert werden soll.
    :param csv_filename: Der Name der CSV-Datei, in die die Ergebnisse geschrieben werden.
    :param title: Der Titel des Jobs, der im Protokoll festgehalten wird.
    :param description: Eine Beschreibung des Jobs, die im Protokoll festgehalten wird.
    :param info_df: Ein DataFrame mit zusätzlichen Informationen, die in das Protokoll geschrieben werden.
    :param limit: Die Anzahl der Zeilen, die aus dem Ergebnis geschrieben werden sollen.
                  Wenn limit gleich 99 ist, werden alle Ergebnisse geschrieben.
    :return: None
    """
    print("brrr, brrr, write, write the result to log")

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        with open(csv_filename, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file, delimiter=';')

            limited_results = result if limit == 99 else result.head(limit)

            write_header(writer, timestamp, title, description)
            write_info_df(writer, info_df)
            write_results_header(writer, limited_results)
            write_results(writer, limited_results)

    except Exception as e:
        print(f"Error writing log: {e}")


def write_header(writer, timestamp, title, description):
    """
    Schreibt den Header für das Protokoll in die CSV-Datei.

    :param writer: Der CSV-Writer, der zum Schreiben in die Datei verwendet wird.
    :param timestamp: Der Zeitstempel des Protokolls.
    :param title: Der Titel des Jobs.
    :param description: Die Beschreibung des Jobs.
    :return: None
    """
    writer.writerow([timestamp])
    writer.writerow([f'Job Title;{title.replace("\"", "")}', ''])
    writer.writerow([f'Job Description;{description.replace("\"", "")}', ''])
    writer.writerow([])


def write_info_df(writer, info_df):
    """
    Schreibt zusätzliche Informationen aus einem DataFrame in die CSV-Datei.

    :param writer: Der CSV-Writer, der zum Schreiben in die Datei verwendet wird.
    :param info_df: Ein DataFrame, der Informationen oder Parameter enthält.
    :return: None
    """
    for index, row in info_df.iterrows():
        writer.writerow([row['Parameter'], row['Value']])
    writer.writerow([])


def write_results_header(writer, limited_results):
    """
    Schreibt die Kopfzeile der Ergebnisse in die CSV-Datei.

    :param writer: Der CSV-Writer, der zum Schreiben in die Datei verwendet wird.
    :param limited_results: Die limitierten Ergebnisse, deren Kopfzeilen geschrieben werden sollen.
    :return: None
    """
    header = [
        limited_results['mId'].name,
        limited_results['acronym'].name,
        limited_results['name'].name,
        limited_results['similarity'].name,
        'similarity_name',
        'similarity_content',
        'similarity_skills'
    ]
    writer.writerow(header)


def write_results(writer, limited_results):
    """
    Schreibt die begrenzten Ergebnisse in die CSV-Datei.

    :param writer: Der CSV-Writer, der zum Schreiben in die Datei verwendet wird.
    :param limited_results: Die limitierten Ergebnisse, die geschrieben werden sollen.
    :return: None
    """
    for index, row in limited_results.iterrows():
        writer.writerow([row['mId'], row['acronym'], row['name'], row['similarity']])
    writer.writerow([])
