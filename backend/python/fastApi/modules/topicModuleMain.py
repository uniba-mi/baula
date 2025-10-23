from typing import Dict, List
from starlette.responses import JSONResponse
from transformers import BertTokenizer, BertModel
from utils.textPrepare import TextPreprocessor
import torch

import pandas as pd

# Load BERT model and tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-german-cased")
model = BertModel.from_pretrained("bert-base-german-cased")

#=============================================================================
#                             PRE-GENERATED EMBEDDINGS
#=============================================================================

def recommendModulesFromEmbeddings(topics: List[Dict[str, any]], modules: List[Dict[str, any]]) -> Dict[str, any]:
    """
    Generate module recommendations using pre-generated embeddings.
   
    Args:
        topics: List of dictionaries with 'tId' and 'vector' for each topic
        modules: List of dictionaries with 'acronym' and 'vector' for each module
       
    Returns:
        Dictionary with recommended modules and their topic-specific scores
    """
    import torch
   
    topic_similarities = {}
    for topic in topics:
        topic_id = topic['tId']
        topic_vector = torch.tensor(topic['vector'])
       
        # Find top 3 modules for this topic
        module_scores = []
        for module in modules:
            module_acronym = module['acronym']
            module_vector = torch.tensor(module['vector'])
           
            similarity = calculate_similarity(topic_vector, module_vector)
            module_scores.append({
                "acronym": module_acronym,
                "score": similarity
            })
       
        top_modules = sorted(module_scores, key=lambda x: x["score"], reverse=True)[:3]
        topic_similarities[topic_id] = top_modules
   
    module_recommendations = {}
    for topic_id, top_modules in topic_similarities.items():
        for module in top_modules:
            acronym = module["acronym"]
            similarity = module["score"]
           
            if acronym not in module_recommendations:
                module_recommendations[acronym] = {
                    "acronym": acronym,
                    "sources": [],
                    "total_score": 0.0,
                    "frequency": 0
                }
            
            topic_exists = any(source["identifier"] == topic_id for source in module_recommendations[acronym]["sources"])
            if not topic_exists:
                module_recommendations[acronym]["sources"].append({
                    "identifier": topic_id,
                    "score": similarity
                })
           
            module_recommendations[acronym]["total_score"] += similarity
            module_recommendations[acronym]["frequency"] += 1
   
    # Calculate average score for each module
    for module in module_recommendations.values():
        module["score"] = module["total_score"] / module["frequency"]
        del module["total_score"]
   
    # Sort modules by frequency and score
    sorted_modules = sorted(
        module_recommendations.values(),
        key=lambda x: (x["frequency"], x["score"]),
        reverse=True
    )
   
    # Return the sorted modules
    return {"recModules": sorted_modules}

#=============================================================================
#                             LIVE-GENERATED EMBEDDINGS
#=============================================================================

# TODO: exchange model

def createEmbeddingsForTopics(topics: List[Dict[str, str]]) -> List[Dict[str, any]]:
    """
    Berechnet Embeddings für eine Liste von Topics mit Hilfe des BERT-Modells.

    :param topics: Eine Liste von Dictionaries mit 'name' und 'description' für jedes Topic.
    :return: Eine Liste von Dictionaries mit 'name' und den zugehörigen Embeddings.
    """    
    
    results = []
    
    for topic in topics:

        name = topic.get("name", "")
        description = topic.get("description", "")
        
        input_text = f"{name} {description}"
        
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        pooled_output = outputs.pooler_output
        
        embedding = pooled_output.squeeze().tolist()
        
        results.append({
            "name": name,
            "embedding": embedding
        })
    
    return results


def generate_embedding(text: str) -> torch.Tensor:
    """
    Generate a BERT embedding for the given text.
    """
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    outputs = model(**inputs)
    return outputs.pooler_output.squeeze()

def recommendModulesFromTopics(topics: List[Dict[str, str]], modules: List[Dict[str, str]]) -> List[Dict[str, any]]:
    """
    Generate module recommendations for a list of topics.
    """
    
    text_preprocessor = TextPreprocessor()

    preprocessed_topics = [
        {
            "tId": topic["tId"],
            "name": text_preprocessor.preprocessText(topic["name"], splitResult=False),
            "description": text_preprocessor.preprocessText(topic["description"], splitResult=False),
        }
        for topic in topics
    ]

    preprocessed_modules = [
        {
            "acronym": module["acronym"],
            "name": text_preprocessor.preprocessText(module["name"], splitResult=False),
            "content": text_preprocessor.preprocessText(module["content"], splitResult=False),
            "skills": text_preprocessor.preprocessText(module.get("skills", ""), splitResult=False),
        }
        for module in modules
    ]

    topic_embeddings = [
        generate_embedding(f"{topic['name']} {topic['description']}") for topic in preprocessed_topics
    ]

    module_embeddings = [
        generate_embedding(f"{module['name']} {module['name']} {module['content']} {module['skills']}")  # Double weight for 'name'
        for module in preprocessed_modules
    ]

    similarities = []
    for topic_index, topic_embedding in enumerate(topic_embeddings):
        topic = preprocessed_topics[topic_index]
        for module, module_embedding in zip(preprocessed_modules, module_embeddings):
            similarity_score = calculate_similarity(topic_embedding, module_embedding)
            similarities.append({
                "acronym": module["acronym"],
                "type": "topic",
                "identifier": topic["tId"],
                "score": similarity_score,
            })

    module_recommendations = {}
    for similarity in similarities:
        acronym = similarity["acronym"]
        if acronym not in module_recommendations:
            module_recommendations[acronym] = {
                "acronym": acronym,
                "source": [],
                "frequency": 0,
                "score": 0.0,
            }

        module_recommendations[acronym]["source"].append({
            "type": similarity["type"],
            "identifier": similarity["identifier"],
            "score": similarity["score"],
        })
        module_recommendations[acronym]["frequency"] += 1
        module_recommendations[acronym]["score"] += similarity["score"]

    # normalize scores by frequency to get the average similarity
    for module_data in module_recommendations.values():
        module_data["score"] /= module_data["frequency"]

    # convert to sorted list of top recommendations
    top_modules = sorted(
        module_recommendations.values(),
        key=lambda x: x["score"],
        reverse=True
    )[:3]
    
    return top_modules

#=============================================================================
#                             COMMON
#=============================================================================

def calculate_similarity(embedding1: torch.Tensor, embedding2: torch.Tensor) -> float:
    """
    Calculate cosine similarity between two embeddings.
    """
    if len(embedding1.shape) > 1:
        embedding1 = embedding1.squeeze()
    if len(embedding2.shape) > 1:
        embedding2 = embedding2.squeeze()
    if embedding1.shape != embedding2.shape:
        raise ValueError(f"Dimension mismatch: {embedding1.shape} vs {embedding2.shape}")
    return torch.nn.functional.cosine_similarity(embedding1, embedding2, dim=0).item()

print("topicModuleMain.py imported")
