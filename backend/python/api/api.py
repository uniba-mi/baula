import sys
import os
from typing import Any, Dict, List
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modules'))

from modules.jobModuleMain import jobModuleProposalKeyWords, keywordsJobDescription
from modules.topicModuleMain import createEmbeddingsForTopics, recommendModulesFromTopics, recommendModulesFromEmbeddings

app = FastAPI()

# Model für die Anforderung von Schlüsselwörtern zu Jobmodulvorschlägen
class JobModuleProposalKeywordsRequest(BaseModel):
    title: str
    keywords: str
    modules: list


# Endpunkt für Jobmodulvorschläge mit Keywords
@app.post("/recommend-modules-for-job")
async def apiJobModuleProposalKeywords(request: JobModuleProposalKeywordsRequest):
    """
    API-Endpunkt zur Erstellung von Modulvorschlägen mit Hilfe von Keywörtern.

    :param request: Enthält die erforderlichen Felder für den Jobmodulvorschlag.
    :return: Antwort für Jobmodulvorschläge mit Schlüsselwörtern.
    """
    return jobModuleProposalKeyWords(request.title, request.keywords, request.modules)


# Model für die Anforderung von Jobkeywords
class JobKeywordsRequest(BaseModel):
    title: str
    description: str
    keywordNumber: int


# Endpunkt für die Erstellung von Jobkeywords
@app.post('/job-keywords')
async def apiKeywords(request: JobKeywordsRequest):
    """
    API-Endpunkt zur Erstellung von Keywörtern eines Jobs.

    :param request: Enthält die erforderlichen Felder für die Jobkeywords.
    :return: Liste von Schlüsselwörtern.
    """
    return keywordsJobDescription(request.title, request.description, request.keywordNumber)

# Model for a single topic
class Topic(BaseModel):
    name: str
    description: str

# Model for several topics
class TopicEmbeddingsBatchRequest(BaseModel):
    topics: List[Topic]

# end point for the creation of topics
@app.post('/topic-embeddings')
async def createTopicEmbeddingsBatch(request: TopicEmbeddingsBatchRequest):
    """
    API-Endpunkt zur Erstellung von Embeddings für eine Liste von Topics.

    :param request: Ein Batch-Request mit mehreren Topics
    :return: Liste von Embeddings für die Topics
    """
    results = createEmbeddingsForTopics([{"name": topic.name, "description": topic.description} for topic in request.topics])
    return {"topics": results}


# Models
class Module(BaseModel):
    acronym: str
    name: str
    content: str
    skills: str

class Topic(BaseModel):
    tId: str
    name: str
    description: str

class RecommendationRequest(BaseModel):
    topics: List[Topic]
    modules: List[Module]

class RecommendationResponse(BaseModel):
    recModules: List[Dict[str, Any]]

#=============================================================================
#                             LIVE-GENERATED EMBEDDINGS
#=============================================================================

@app.post("/topic-module-recommendations", response_model=RecommendationResponse)
async def recommendModules(data: RecommendationRequest):
    try:
        topics = [{"tId": topic.tId, "name": topic.name, "description": topic.description} for topic in data.topics]
        modules = [
            {"acronym": module.acronym, "name": module.name, "content": module.content, "skills": module.skills}
            for module in data.modules
        ]
        recommendations = recommendModulesFromTopics(topics, modules)
        return {"recModules": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

#=============================================================================
#                             PRE-GENERATED EMBEDDINGS
#=============================================================================

class TopicEmbedding(BaseModel):
    tId: str
    vector: List[float]

class ModuleEmbedding(BaseModel):
    acronym: str
    vector: List[float]

class EmbeddingRecommendationRequest(BaseModel):
    topicEmbeddings: List[TopicEmbedding]
    moduleEmbeddings: List[ModuleEmbedding]

@app.post("/topic-module-recommendations-pre-generated", response_model=RecommendationResponse)
async def recommendModulesPreGenerated(data: EmbeddingRecommendationRequest):
    
    print(f"Python API received - Topics: {len(data.topicEmbeddings)}, Modules: {len(data.moduleEmbeddings)}")
    
    try:
        topics = [
            {
                "tId": topic.tId,
                "vector": topic.vector
            } 
            for topic in data.topicEmbeddings
        ]
        
        modules = [
            {
                "acronym": module.acronym,
                "vector": module.vector
            }
            for module in data.moduleEmbeddings
        ]
        
        result  = recommendModulesFromEmbeddings(topics, modules)
        
        if not isinstance(result, dict) or "recModules" not in result:
            if isinstance(result, list):
                result = {"recModules": result}
        
        print(f"Python API returning {len(result.get('recModules', []))} recommendations")
        
        return result
    except Exception as e:
        print(f"Error in API endpoint: {str(e)}")
        print(f"Python API ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")