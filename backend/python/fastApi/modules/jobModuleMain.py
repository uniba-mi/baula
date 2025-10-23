from starlette.responses import JSONResponse
from models.similaritySklearn import calculate_similarity_sklearn
from models.similarityBert import calculate_similarity_bert

from utils.textPrepare import TextPreprocessor
from utils.evaluateSectionRelevance import SectionEvaluator
from utils.logging import writeResultLog
from utils.keywordExtractionBert import keywordExtraction

import pandas as pd


def string_to_boolean(s: str) -> bool:
    """
        Konvertiert einen String in einen booleschen Wert.

        :param s: Der String, der konvertiert werden soll ('true' oder 'false').
        :return: Entsprechender boolescher Wert.
        :raises ValueError: Wenn der Eingabestring ungültig ist.
        """
    if s.lower() == 'true':
        return True
    elif s.lower() == 'false':
        return False
    else:
        raise ValueError("Invalid input: must be 'True' or 'False'")


def getTitleDescriptionFromModuleList(moduleList: list[dict]) -> list[dict]:
    """
    Extrahiert Titel und Beschreibung aus einer Liste von Modulen.

    :param moduleList: Liste von Modul-Dictionarys.
    :return: Eine Liste von Dictionaries mit den Schlüsseln 'name' und 'description'.
    """
    titleDescriptionList = []
    for module in moduleList:
        titleDescriptionList.append({'name': module['name'], 'description': module['content']})
    return titleDescriptionList


def modulePreprocessing(modules: list[dict], module_names: list[str], textPreprocessor: TextPreprocessor,
                        split: bool = False) -> list[dict]:
    """
        Verarbeitet Text in den angegebenen Modulen.

        :param modules: Liste von Modulen.
        :param module_names: Namen der Felder, die verarbeitet werden sollen.
        :param textPreprocessor: Instanz von TextPreprocessor zur Verarbeitung des Texts.
        :param split: Flag, ob der Text gesplittet werden soll.
        :return: Verarbeitete Liste von Modulen.
        """
    for module in modules:
        for name in module_names:
            if len(module[name]) > 0:
                module[name] = textPreprocessor.preprocessText(module[name], split)

    return modules

def preProcessText(job_description: dict, modules: list[dict], split: bool = False) -> tuple[dict, list[dict]]:
    """
     Bereitet den Text für die Stellenbeschreibung und die Module vor.

     :param job_description: Die Stellenbeschreibung als Dictionary.
     :param modules: Liste der Module.
     :param split: Flag, ob der Text gesplittet werden soll.
     :return: Tuple bestehend aus der bearbeiteten Stellenbeschreibung und den bearbeiteten Modulen.
     """
    textPreprocessor = TextPreprocessor()
    job_description['title'] = textPreprocessor.preprocessText(job_description['title'], split)
    job_description['description'] = textPreprocessor.preprocessText(job_description['description'], split)

    module_names = ['content', 'skills', 'name', 'chair']
    modules = modulePreprocessing(modules, module_names, textPreprocessor, split)

    return job_description, modules


def calculate_semantic_similarity(modelType: str, job_description: dict, module_list: list[dict], jobTitleOnly: bool) -> \
        list[dict]:
    """
    Berechnet die semantische Ähnlichkeit zwischen der Stellenbeschreibung und der Modul-Liste.

    :param modelType: Der zu verwendende Modelltyp ('sklearn' oder 'bert').
    :param job_description: Dictionary mit der Stellenbeschreibung.
    :param module_list: Liste der Module.
    :param jobTitleOnly: Flag, ob nur der Jobtitel berücksichtigt werden soll.
    :return: Liste von ähnlichen Modulen.
    """
    if modelType == 'sklearn':
        return calculate_similarity_sklearn(job_description, module_list, jobTitleOnly)
    elif modelType == 'bert':
        return calculate_similarity_bert(job_description, module_list, jobTitleOnly)
    else:
        print("Model Type not found")
        return []


def jobModuleProposalKeyWords(title: str, keywords: str, modules: list,
                              resultLimit: int = 5) -> JSONResponse:
    """
    Erstellt einen Vorschlag für Module basierend auf Schlüsselwörtern.

    :param title: Titel des Jobs.
    :param keywords: Schlüsselwörter für die Suche.
    :param modules: mögliche Module, die empfohlen werden können.
    :param resultLimit: Maximale Anzahl zurückgegebener Ergebnisse.
    :return: JSONResponse mit den Vorschlägen für Module.
    """
    job_description = {"title": title, "description": keywords}

    module_list = modules

    textPreprocessor = TextPreprocessor()
    split = False

    module_names = ['content', 'skills', 'name', 'chair']
    module_list = modulePreprocessing(module_list, module_names, textPreprocessor, split)

    result = calculate_similarity_bert(job_description, module_list)

    limited_results = result.head(resultLimit).to_dict(orient='records')
    print(limited_results)

    resultLogging = False
    parameters = ["textPreProcessing", "modelType", "jobTitleOnly", "sectionRelevanze", "keyWordExtraction"]
    values = [True, 'bert', False, True, True]
    information_df = pd.DataFrame(zip(parameters, values), columns=["Parameter", "Value"])

    if resultLogging:
        csv_filename = './jobModuleLog.csv'
        writeResultLog(result, csv_filename, job_description['title'], job_description['description'], information_df,
                       limit=resultLimit)

    jsonResponse = JSONResponse({
        "title": job_description["title"],
        "keywords": keywords,
        "recModules": limited_results
    })
    print(jsonResponse)
    return jsonResponse


def keywordsJobDescription(title: str, description: str, keywordNumber: int) -> JSONResponse:
    """
    Extrahiert Schlüsselwörter aus der Stellenbeschreibung.

    :param title: Titel des Jobs.
    :param description: Beschreibung des Jobs.
    :param keywordNumber: Anzahl der zu extrahierenden Schlüsselwörter.
    :return: JSONResponse mit den extrahierten Schlüsselwörtern.
    """

    evaluator = SectionEvaluator()
    relevantDescription = evaluator.evaluateSection(description, relevance='important')
    if relevantDescription:
        description = description

    keywords = keywordExtraction(description, preprocess=False, top_n=keywordNumber)
    jsonResponse = JSONResponse({
        "title": title,
        "description": description,
        "keywords": keywords
    })
    return jsonResponse


print("jobModuleMain.py imported")
