import pandas as pd
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity


def get_bert_embeddings(text, model, tokenizer):
    """
     Holt die BERT-Embeddings für gegebenen Text.

     :param text: Der Eingabetext, für den die Embeddings berechnet werden sollen.
     :param model: Das BERT-Modell, das zur Berechnung der Embeddings verwendet wird.
     :param tokenizer: Der BERT-Tokenizer, der zum Vorverarbeiten des Texts verwendet wird.
     :return: Die BERT-Embeddings als Numpy-Array.
     """
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512)
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().detach().numpy()


def calculate_similarity_bert(job_description: dict, modules: list[dict], jobTitleOnly: bool = False) -> pd.DataFrame:
    """
    Berechnet die Ähnlichkeit zwischen der Stellenbeschreibung und einer Liste von Modulen unter Verwendung von BERT.

    :param job_description: Das Dictionary mit der Stellenbeschreibung {title: 'title_value', description: 'description_value'}.
    :param modules: Eine Liste von Modulen, die bewertet werden sollen.
    :param jobTitleOnly: Flag, das angibt, ob nur der Jobtitel berücksichtigt werden soll.
    :return: Ein DataFrame, das die Module mit ihren Ähnlichkeitsscores enthält.
    """
    tokenizer = BertTokenizer.from_pretrained('bert-base-german-cased')
    model = BertModel.from_pretrained('bert-base-german-cased')

    if jobTitleOnly:
        job_text = f"{job_description['title']}"
    else:
        job_text = f"{job_description['title']} {job_description['description']}"

    job_embedding = get_bert_embeddings(job_text, model, tokenizer)

    similarities = []
    for module in modules:
        module_text = f"{module['name']} {module['content']} {module['skills']} {module['chair']} {module['name']}"
        module_embedding = get_bert_embeddings(module_text, model, tokenizer)
        similarity = cosine_similarity([job_embedding], [module_embedding])[0][0]
        rounded_similarity = round(similarity, 4)
        similarities.append(rounded_similarity)

    modules_df = pd.DataFrame(modules)
    modules_df['score'] = similarities

    filtered_modules = modules_df.loc[modules_df['score'] > 0.0]
    sorted_modules = filtered_modules.sort_values(by='score', ascending=False)

    return sorted_modules[['acronym', 'score']]
