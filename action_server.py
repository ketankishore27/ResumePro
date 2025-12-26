from typing import List
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from ai_operations.chains import *
from ai_operations.utility_function import create_resume_score, get_summary_overview, \
                                           extract_yoe, extract_recruiters_overview, \
                                           company_extractor
from db_operations.utility_db import *
import structlog
structlogger = structlog.get_logger(__name__)

# Configure logging to suppress socket.io 404 logs
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

resume_score_agent, resume_score_prompt = create_resume_score()
summary_agent, summary_prompt = get_summary_overview()
yoe_agent, yoe_prompt = extract_yoe()
recruiters_overview_agent, recruiters_overview_prompt = extract_recruiters_overview()
company_extractor_agent, company_extractor_prompt = company_extractor()

# Create custom middleware to filter out socket.io requests from logs
class SocketIOFilterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if "/ws/socket.io/" in request.url.path:
            # Skip logging for socket.io requests
            return await call_next(request)
        return await call_next(request)

app = FastAPI(docs_url=None, redoc_url=None)  # Disable automatic docs to reduce noise

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Add socket.io filter middleware
app.add_middleware(SocketIOFilterMiddleware)

@app.post("/test")
def test_endpoint():
    return {"status": "success", "message": "Server is working!"}

@app.post("/getNames")
def getNames(data: dict):
    structlogger.debug("API: /getNames - Received request")
    resumeText = data.get("resumeText", "")
    email_id = data.get("email_id", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            names = name_extractor_chain.invoke({"resume_text": resumeText, "email_id": email_id})
            if isinstance(names, dict):
                if 'name' in names:
                    structlogger.debug("API: /getNames - Request completed")
                    return names

            structlogger.debug("API: /getNames - Response data:", response=names)
        except Exception as e:
            structlogger.debug("API: /getNames - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getNames - Retrying. Ended Iteration:", details=iteration)    
        
    return {"name": "Failed"}

@app.post("/scoreResume")
def scoreResume(data: dict):
    structlogger.debug("API: /scoreResume - Received request")
    resumeText = data.get("resumeText", "")
    jobRole = data.get("jobRole", "")
    jobDescription = data.get("jobDescription", "")
    resume_score_prompt_formatted = resume_score_prompt.format(jobRole = jobRole, 
                                                               jobDescription = jobDescription, 
                                                               resume = resumeText)

    max_iter = 5
    for iteration in range(max_iter):
        try:
            response_scoring = resume_score_agent.invoke({"messages": [{"role": "user", "content": resume_score_prompt_formatted.format()}]})
            #scores_resume = scoring_chain.invoke({"resume": resumeText, "jobRole": jobRole, "jobDescription": jobDescription})#.get("properties")
            response = response_scoring.get("structured_response", None).model_dump()

            if isinstance(response, dict):
                if all(key in response for key in ['score', 'items']):
                    structlogger.debug("API: /scoreResume - Request completed")
                    return {
                            "score": response['score'],
                            "jobRole": jobRole,
                            "items": response['items']
                            }

            structlogger.debug("API: /scoreResume - Response data:", response=response)
        except Exception as e:
            structlogger.debug("API: /scoreResume - Exception occurred", details=e)
            pass

        structlogger.debug("API: /scoreResume - Retrying. Ended Iteration:", details=iteration)    

    return {    
        "score": 0.1,
        "jobRole": jobRole,
        "items": []
    }
    
@app.post("/getContacts")
def getContacts(data: dict):
    structlogger.debug("API: /getContacts - Received request")
    resumeText = data.get("resumeText")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            contact_info = contact_extractor_chain.invoke({"resume_text": resumeText})
            keys_to_check = ['color', 'comment', 'email_id', 'mobile_number']
            if isinstance(contact_info, dict):
                
                if all(key in contact_info for key in keys_to_check):
                    structlogger.debug("API: /getContacts - Request completed")
                    return contact_info

            structlogger.debug("API: /getContacts - Response data:", response=contact_info)
        except Exception as e:
            structlogger.debug("API: /getContacts - Exception occurred", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {    
        "color": "red",
        "comment": "Issue in Processing",
        "email_id": "",
        "mobile_number": ""
    }

@app.post("/getSummaryOverview")
def getSummaryOverview(data: dict):
    structlogger.debug("API: /getSummaryOverview - Received request")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    resume_score_prompt_formatted = summary_prompt.format(resume = resumeText, job_role = jobRole)

    max_iter = 5
    for iteration in range(max_iter):
        try:
            summary_info = summary_agent.invoke({"messages": [{"role": "user", "content": resume_score_prompt_formatted.format()}]})
            summary_response = summary_info.get("structured_response", None).model_dump()
            keys_to_check = ['color', 'score', 'label', 'comment', 'summary']
            if isinstance(summary_response, dict):
                if all(key in summary_response for key in keys_to_check) and isinstance(summary_response['summary'], list):
                    structlogger.debug("API: /getSummaryOverview - Request completed")
                    return summary_response

            structlogger.debug("API: /getSummaryOverview - Response data:", response=summary_info)
        except Exception as e:
            structlogger.debug("API: /getSummaryOverview - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getSummaryOverview - Retrying. Ended Iteration:", details=iteration)    
        
    return {'score': 0,
            'color': 'red',
            'label': 'critical',
            'comment': 'Issue in Processing'}

@app.post("/getCustomScores")
def getCustomScores(data: dict):
    structlogger.debug("API: /getCustomScores - Received request")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            custom_scores_info = custom_score_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['searchibility_score', 'hard_skills_score', 'soft_skill_score', 'formatting_score']
            if isinstance(custom_scores_info, dict):
                if all(key in custom_scores_info for key in keys_to_check):
                    structlogger.debug("API: /getCustomScores - Request completed")
                    return custom_scores_info

            structlogger.debug("API: /getCustomScores - Response data:", response=custom_scores_info)
        except Exception as e:
            structlogger.debug("API: /getCustomScores - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getCustomScores - Retrying. Ended Iteration:", details=iteration)    
        
    return {'searchibility_score': 0,
            'hard_skills_score': 0,
            'soft_skill_score': 0,
            'formatting_score': 0}

@app.post("/getOtherComments")
def getOtherComments(data: dict):
    structlogger.debug("API: /getOtherComments - Received request")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            other_comments_info = other_comments_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['headings_feedback', 'title_match', 'formatting_feedback']
            if isinstance(other_comments_info, dict):
                if all(key in other_comments_info for key in keys_to_check):
                    structlogger.debug("API: /getOtherComments - Request completed")
                    return other_comments_info

            structlogger.debug("API: /getOtherComments - Response data:", response=other_comments_info)
        except Exception as e:
            structlogger.debug("API: /getOtherComments - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getOtherComments - Retrying. Ended Iteration:", details=iteration)    
        
    return {'headings_feedback': '',
            'title_match': '',
            'formatting_feedback': ''}

@app.post("/getFunctionalConstituent")
def getFunctionalConstituent(data: dict):
    structlogger.debug("API: /getFunctionalConstituent - Received request")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            functional_constituent_info = functional_constituent_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['constituent', 'industries', 'has_industry_experience', 'has_completed_college']
            if isinstance(functional_constituent_info, dict):
                if all(key in functional_constituent_info for key in keys_to_check):
                    structlogger.debug("API: /getFunctionalConstituent - Request completed")
                    return functional_constituent_info

            structlogger.debug("API: /getFunctionalConstituent - Response data:", response=functional_constituent_info)
        except Exception as e:
            structlogger.debug("API: /getFunctionalConstituent - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getFunctionalConstituent - Retrying. Ended Iteration:", details=iteration)    
        
    return {'constituent': '',
            'industries': '', 
            'has_industry_experience': '',
            'has_completed_college': ''}

@app.post("/getTechnicalConstituent")
def getTechnicalConstituent(data: dict):
    structlogger.debug("API: /getTechnicalConstituent - Received request")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            technical_constituent_info = technical_constituent_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['high', 'medium', 'low']
            if isinstance(technical_constituent_info, dict):
                if all(key in technical_constituent_info for key in keys_to_check):
                    structlogger.debug("API: /getTechnicalConstituent - Request completed")
                    return technical_constituent_info

            structlogger.debug("API: /getTechnicalConstituent - Response data:", response=technical_constituent_info)
        except Exception as e:
            structlogger.debug("API: /getTechnicalConstituent - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getTechnicalConstituent - Retrying. Ended Iteration:", details=iteration)    
        
    return {'technical_exposure': ''}

@app.post("/getEducation")
def getEducation(data: dict):
    structlogger.debug("API: /getEducation - Received request")
    resumeText = data.get("resumeText")
    schema_iteration_check = 0
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            education_info = education_extractor_chain.invoke({"resume_text": resumeText})
            for ent in education_info:
                keys_to_check = ['degree', 'institution', 'start_year', 'end_year']
                if isinstance(ent, dict):
                    if all(key in ent for key in keys_to_check):
                        schema_iteration_check += 1

            if schema_iteration_check == len(education_info):
                structlogger.debug("API: /getEducation - Request completed")
                return education_info
    
            structlogger.debug("API: /getEducation - Response data:", response=education_info)
        except Exception as e:
            structlogger.debug("API: /getEducation - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getEducation - Retrying. Ended Iteration:", details=iteration)    
        
    return {'education_history': []}

@app.post("/getProjects")
def getProjects(data: dict):
    structlogger.debug("API: /getProjects - Received request")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    schema_iteration_check = 0
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            project_info = project_extractor_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            if isinstance(project_info['projects'], list):
                for ent in project_info['projects']:
                    keys_to_check = ['title', 'description', 'technologies', 'score', 'color', 'comment', 'stage']
                    if isinstance(ent, dict):
                        if all(key in ent for key in keys_to_check):
                            schema_iteration_check += 1

            if schema_iteration_check == len(project_info['projects']):
                structlogger.debug("API: /getProjects - Request completed")
                return project_info
    
            structlogger.debug("API: /getProjects - Response data:", response=project_info)
        except Exception as e:
            structlogger.debug("API: /getProjects - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getProjects - Retrying. Ended Iteration:", details=iteration)    
        
    return {'projects': []}
        
@app.post("/getCompany")
def getCompany(data: dict):
    structlogger.debug("API: /getCompany - Received request")
    resumeText = data.get("resumeText")
    schema_iteration_check = 0
    company_extractor_prompt_formatted = company_extractor_prompt.format(resume = resumeText)
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            company_info = company_extractor_agent.invoke({"messages": [{"role": "user", "content": company_extractor_prompt_formatted}]})
            company_info = company_info.get("structured_response", None).model_dump()
            if isinstance(company_info['employment_history'], list):
                for ent in company_info['employment_history']:
                    keys_to_check = ['company', 'position', 'start_year', 'end_year', 'employment_type']
                    if isinstance(ent, dict):
                        if all(key in ent for key in keys_to_check):
                            schema_iteration_check += 1

            if schema_iteration_check == len(company_info['employment_history']):
                structlogger.debug("API: /getCompany - Request completed")
                return company_info
    
            structlogger.debug("API: /getCompany - Response data:", response=company_info)
        except Exception as e:
            structlogger.debug("API: /getCompany - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getCompany - Retrying. Ended Iteration:", details=iteration)    
        
    return {'employment_history': []}

@app.post("/getYoe")
def getYoe(data: dict):
    structlogger.debug("API: /getYoe - Received request")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    yoe_prompt_formatted = yoe_prompt.format(resume = resumeText, job_role = jobRole)
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            yoe_info = yoe_agent.invoke({"messages": [{"role": "user", "content": yoe_prompt_formatted.format()}]})
            yoe_info = yoe_info.get("structured_response", None).model_dump()
            keys_to_check = ['yoe', 'ryoe']
            if isinstance(yoe_info, dict):
                if all(key in yoe_info for key in keys_to_check):
                    structlogger.debug("API: /getYoe - Request completed")
                    return yoe_info

            structlogger.debug("API: /getYoe - Response data:", response=yoe_info)
        except Exception as e:
            structlogger.debug("API: /getYoe - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getYoe - Retrying. Ended Iteration:", details=iteration)    
        
    return {'yoe': 0, 'ryoe': 0}

@app.post("/getRecruitersOverview")
def getRecruitersOverview(data: dict):
    structlogger.debug("API: /getRecruitersOverview - Received request")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    recruiters_overview_prompt_formatted = recruiters_overview_prompt.format(resume = resumeText, job_role = jobRole)
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            recruiters_overview_info = recruiters_overview_agent.invoke({"messages": [{"role": "user", "content": recruiters_overview_prompt_formatted}]})
            recruiters_overview_info = recruiters_overview_info.get("structured_response", None).model_dump()
            keys_to_check = ['bullets', 'relevant_experience', 'technical_proficiency']
            if isinstance(recruiters_overview_info, dict):
                if all(key in recruiters_overview_info for key in keys_to_check):
                    if isinstance(recruiters_overview_info['bullets'], list) and \
                       isinstance(recruiters_overview_info['technical_proficiency'], list):
                        structlogger.debug("API: /getRecruitersOverview - Request completed")
                        return recruiters_overview_info

            structlogger.debug("API: /getRecruitersOverview - Response data:", response=recruiters_overview_info)
        except Exception as e:
            structlogger.debug("API: /getRecruitersOverview - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getRecruitersOverview - Retrying. Ended Iteration:", details=iteration)    
        
    return {'bullets': [], 'relevant_experience': '', 'technical_proficiency': []}

@app.post("/getDesignation")
def getDesignation(data: dict):
    structlogger.debug("API: /getDesignation - Received request")
    resumeText = data.get("resumeText")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            designation_info = designation_extractor_chain.invoke({"resume": resumeText})
            keys_to_check = ['current_designation', 'previous_designation']
            if isinstance(designation_info, dict):
                if all(key in designation_info for key in keys_to_check):
                    structlogger.debug("API: /getDesignation - Request completed")
                    return designation_info

            structlogger.debug("API: /getDesignation - Response data:", response=designation_info)
        except Exception as e:
            structlogger.debug("API: /getDesignation - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getDesignation - Retrying. Ended Iteration:", details=iteration)    
        
    return {'current_designation': '', 'previous_designation': ''}

@app.post("/assembleData")
def assembleData(data: dict):
    try:
        structlogger.debug("API: /assembleData - Received request")
        status = insert_data(data)
        structlogger.debug("API: /assembleData - Request completed")
        return status
    except Exception as e:
        structlogger.debug("API: /assembleData - Exception occurred", details=e)
        return {"response": "Failed"}

@app.post("/processBulkImport")
async def process_bulk_import(data: dict):

    try:
        structlogger.debug("API: /processBulkImport - Received request")
        data['request_type'] = "adhoc"
        return_payload= await process_individual_resume(data)
        structlogger.debug("API: /processBulkImport - Request completed")
        return return_payload
    except Exception as e:
        structlogger.debug("API: /processBulkImport - Exception occurred", details=e)
        return {
                    "email_id": "",
                    "contact_number": "",
                    "name": "",
                    "summary_overview": "",
                    "parsed_status": "UnSuccessful"
                }
    
@app.post("/extractData")
def extract_data_db(data: dict):
    try:
        email_id = data.get("email_id", None)
        
        return_payload = extract_data(email_id)
        
        if len(return_payload) == 0:
            return {"response": "Candidate not found", "error": "Relevant Candidate Not Found", "status": 404}
        
        # Return the first candidate
        result = return_payload[0]
        structlogger.debug("API: /extractData - Request completed")
        return result

    except Exception as e:
        structlogger.debug("API: /extractData - Exception occurred", details=e)
        return {"response": "Failed to extract data", "error": "An error occurred while processing your request", "status": 500}

@app.post("/getLocation")
def get_location(data: dict):
    structlogger.debug("API: /getLocation - Received request")
    resumeText = data.get("resumeText")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            location_info = location_extractor_chain.invoke({"resume_text": resumeText})
            keys_to_check = ['location', 'confidence_score']
            if isinstance(location_info, dict):
                if all(key in location_info for key in keys_to_check):
                    structlogger.debug("API: /getLocation - Request completed")
                    return location_info

            structlogger.debug("API: /getLocation - Response data:", response=location_info)
        except Exception as e:
            structlogger.debug("API: /getLocation - Exception occurred", details=e)
            pass

        structlogger.debug("API: /getLocation - Retrying. Ended Iteration:", details=iteration)    
        
    return {'location': '', 'confidence_score': 0}

@app.post("/filterCandidate")
def filter_candidate(data: dict):
    try:
        structlogger.debug("API: /filterCandidate - Received request")
        wordList = data.get("wordList", None)
        jobRole = data.get("jobRole", None)
        jobDescription = data.get("jobDescription", None)
        experience = data.get("experienceFilter", None)
        recentResumeCount = data.get("recentResumeCount", None)
        
        return refined_resume(wordList, jobRole, jobDescription, experience, recentResumeCount)

    except Exception as e:
        structlogger.debug("API: /filterCandidate - Exception occurred", details=e)
        return {"response": "Failed to filter candidate", "error": "An error occurred while processing your request", "status": 500}

@app.get("/getAllCandidates")
def get_all_candidates():
    try:
        structlogger.debug("API: /getAllCandidates - Received request")
        candidates = extract_all_resumes()
        structlogger.debug(f"API: /getAllCandidates - Returning {len(candidates)} candidates")
        structlogger.debug("API: /getAllCandidates - Request completed")
        return candidates
    except Exception as e:
        structlogger.debug("API: /getAllCandidates - Exception occurred", details=e)
        return {"response": "Failed to retrieve candidates", "error": "An error occurred while processing your request", "status": 500}

@app.get("/getAllCandidatesDropdown")
def get_candidates_dropdown_api():
    try:
        structlogger.debug("API: /getAllCandidatesDropdown - Received request")
        candidates = get_all_candidates_dropdown()
        structlogger.debug(f"API: /getAllCandidatesDropdown - Returning {len(candidates)} candidates")
        structlogger.debug("API: /getAllCandidatesDropdown - Request completed")
        return candidates
    except Exception as e:
        structlogger.debug("API: /getAllCandidatesDropdown - Exception occurred", details=e)
        return {"response": "Failed to retrieve candidates", "error": "An error occurred while processing your request", "status": 500}

@app.get("/getRefinedResume")
def getRefinedResume(data: dict):
    try:
        structlogger.debug("API: /getRefinedResume - Received request")
        refined_resume = get_refined_resume(
            wordList = data.get("wordList", []),
            jobRole = data.get("jobRole", None),
            jobDescription = data.get("jobDescription", None),
            experience = data.get("experienceFilter", None),
            recent_resume_count = data.get("recentResumeCount", None)
            
        )
        structlogger.debug("API: /getRefinedResume - Returning refined resume")
        structlogger.debug("API: /getRefinedResume - Request completed")
        return refined_resume
    except Exception as e:
        structlogger.debug("API: /getRefinedResume - Exception occurred", details=e)
        return {"response": "Failed to retrieve refined resume", "error": "An error occurred while processing your request", "status": 500}
        

