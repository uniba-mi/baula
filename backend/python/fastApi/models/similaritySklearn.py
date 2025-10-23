import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def calculate_similarity_sklearn(job_description: dict, modules: list[dict],
                                 jobTitleOnly: bool = False) -> pd.DataFrame:
    """
    Berechnet die Ähnlichkeiten zwischen einer Stellenanzeige und einer Liste von Modulen.

    :param job_description: dict, enthält den Namen und die Beschreibung der Stellenanzeige.
    :param modules: list of dicts, enthält Namen und Beschreibungen der Module.
    :return: DataFrame mit Ähnlichkeiten der Module zur Stellenanzeige.
    """

    print('Calculate sklearn')

    pd.set_option('display.expand_frame_repr', False)  # Verhindert Zeilenumbrüche in der Darstellung
    pd.set_option('display.max_columns', None)  # Zeigt alle Spalten an
    pd.set_option('display.max_colwidth', None)  # Setzt die maximale Spaltenbreite auf unbegrenzt

    modules_df = pd.DataFrame(modules)

    if jobTitleOnly:
        job_text = f"{job_description['title']}"
    else:
        job_text = f"{job_description['title']}" + " " + f"{job_description['description']}"

    corpus_title = list(
        modules_df['name'] + modules_df['content'] + modules_df['skills'] + modules_df['chair'] + modules_df[
            'name']) + [job_text]

    vectorizer = TfidfVectorizer()
    X_Title = vectorizer.fit_transform(corpus_title)

    similarity_matrix_title = cosine_similarity(X_Title[:len(modules)], X_Title[len(modules):])

    similarities = [round(similarity, 4) for similarity in similarity_matrix_title[:, 0]]

    modules_df['score'] = similarities

    filtered_modules = modules_df.loc[modules_df['score'] > 0.0]

    sorted_modules = filtered_modules.sort_values(by='score', ascending=False)

    # writeModuleLog(modules_df)
    return sorted_modules[['acronym', 'name', 'score', 'mId']]


def writeModuleLog(df: pd.DataFrame) -> None:
    """
    Schreibt ein DataFrame mit Modul-Ähnlichkeiten in eine CSV-Datei.

    :param df: DataFrame, das die zu protokollierenden Modul-Daten enthält.
    :return: None
    """
    filename = 'moduleLog.csv'
    try:
        df.to_csv(filename, mode='a', index=False, sep=';')
    except Exception as e:
        print(f"Error writing log: {e}")
