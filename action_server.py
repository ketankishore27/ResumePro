from typing import List
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from ai_operations.chains import *
from db_operations.utility_db import *
import structlog
structlogger = structlog.get_logger(__name__)

# Configure logging to suppress socket.io 404 logs
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

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
    structlogger.debug("Received request for getNames")
    resumeText = data.get("resumeText", "")
    email_id = data.get("email_id", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            names = name_extractor_chain.invoke({"resume_text": resumeText, "email_id": email_id})
            if isinstance(names, dict):
                if 'name' in names:
                    return names

            structlogger.debug(names)
        except Exception as e:
            structlogger.debug("Exception in getNames", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {"name": "Failed"}

@app.post("/scoreResume")
def scoreResume(data: dict):
    structlogger.debug("Received request for scoreResume")
    resumeText = data.get("resumeText", "")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            scores_resume = scoring_chain.invoke({"resume": resumeText, "jobRole": jobRole})
            
            if isinstance(scores_resume, dict):
                if isinstance(scores_resume['score'], int) and isinstance(scores_resume['items'], list):
                    return {
                            "score": scores_resume['score'],
                            "jobRole": jobRole,
                            "items": scores_resume['items']
                            }

            structlogger.debug(scores_resume)
        except Exception as e:
            structlogger.debug("Exception in scoreResume:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    

    return {    
        "score": 0.1,
        "jobRole": jobRole,
        "items": []
    }
    
@app.post("/getContacts")
def getContacts(data: dict):
    structlogger.debug("Received request for getContacts")
    resumeText = data.get("resumeText")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            contact_info = contact_extractor_chain.invoke({"resume_text": resumeText})
            keys_to_check = ['color', 'comment', 'email_id', 'mobile_number']
            if isinstance(contact_info, dict):
                
                if all(key in contact_info for key in keys_to_check):
                    return contact_info

            structlogger.debug(contact_info)
        except Exception as e:
            structlogger.debug("Exception in contactInfo:", details=e)
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
    structlogger.debug("Received request for getSummaryOverview")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            summary_info = summary_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['color', 'score', 'label', 'comment', 'summary']
            if isinstance(summary_info, dict):
                if all(key in summary_info for key in keys_to_check) and isinstance(summary_info['summary'], list):
                    return summary_info

            structlogger.debug(summary_info)
        except Exception as e:
            structlogger.debug("Exception in summaryInfo:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'score': 0,
            'color': 'red',
            'label': 'critical',
            'comment': 'Issue in Processing'}

@app.post("/getCustomScores")
def getCustomScores(data: dict):
    structlogger.debug("Received request for getCustomScores")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            custom_scores_info = custom_score_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['searchibility_score', 'hard_skills_score', 'soft_skill_score', 'formatting_score']
            if isinstance(custom_scores_info, dict):
                if all(key in custom_scores_info for key in keys_to_check):
                    return custom_scores_info

            structlogger.debug(custom_scores_info)
        except Exception as e:
            structlogger.debug("Exception in customScores:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'searchibility_score': 0,
            'hard_skills_score': 0,
            'soft_skill_score': 0,
            'formatting_score': 0}

@app.post("/getOtherComments")
def getOtherComments(data: dict):
    structlogger.debug("Received request for getOtherComments")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            other_comments_info = other_comments_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['headings_feedback', 'title_match', 'formatting_feedback']
            if isinstance(other_comments_info, dict):
                if all(key in other_comments_info for key in keys_to_check):
                    return other_comments_info

            structlogger.debug(other_comments_info)
        except Exception as e:
            structlogger.debug("Exception in otherComments:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'headings_feedback': '',
            'title_match': '',
            'formatting_feedback': ''}

@app.post("/getFunctionalConstituent")
def getFunctionalConstituent(data: dict):
    structlogger.debug("Received request for getFunctionalConstituent")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            functional_constituent_info = functional_constituent_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['constituent', 'industries', 'has_industry_experience', 'has_completed_college']
            if isinstance(functional_constituent_info, dict):
                if all(key in functional_constituent_info for key in keys_to_check):
                    return functional_constituent_info

            structlogger.debug(functional_constituent_info)
        except Exception as e:
            structlogger.debug("Exception in functionalConstituent:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'constituent': '',
            'industries': '', 
            'has_industry_experience': '',
            'has_completed_college': ''}

@app.post("/getTechnicalConstituent")
def getTechnicalConstituent(data: dict):
    structlogger.debug("Received request for getTechnicalConstituent")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            technical_constituent_info = technical_constituent_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['high', 'medium', 'low']
            if isinstance(technical_constituent_info, dict):
                if all(key in technical_constituent_info for key in keys_to_check):
                    return technical_constituent_info

            structlogger.debug(technical_constituent_info)
        except Exception as e:
            structlogger.debug("Exception in technicalConstituent:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'technical_exposure': ''}

@app.post("/getEducation")
def getEducation(data: dict):
    structlogger.debug("Received request for getEducation")
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
                return education_info
    
            structlogger.debug(education_info)
        except Exception as e:
            structlogger.debug("Exception in educationExtractor:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'education_history': []}

@app.post("/getProjects")
def getProjects(data: dict):
    structlogger.debug("Received request for getProjects")
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
                return project_info
    
            structlogger.debug(project_info)
        except Exception as e:
            structlogger.debug("Exception in projectExtractor:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'projects': []}
        
@app.post("/getCompany")
def getCompany(data: dict):
    structlogger.debug("Received request for getCompany")
    resumeText = data.get("resumeText")
    schema_iteration_check = 0
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            company_info = company_extractor_chain.invoke({"resume_text": resumeText})
            if isinstance(company_info['employment_history'], list):
                for ent in company_info['employment_history']:
                    keys_to_check = ['company', 'position', 'start_year', 'end_year', 'employment_type']
                    if isinstance(ent, dict):
                        if all(key in ent for key in keys_to_check):
                            schema_iteration_check += 1

            if schema_iteration_check == len(company_info['employment_history']):
                return company_info
    
            structlogger.debug(company_info)
        except Exception as e:
            structlogger.debug("Exception in companyExtractor:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'employment_history': []}

@app.post("/getYoe")
def getYoe(data: dict):
    structlogger.debug("Received request for getYoe")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            yoe_info = yoe_extractor_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['yoe', 'ryoe']
            if isinstance(yoe_info, dict):
                if all(key in yoe_info for key in keys_to_check):
                    return yoe_info

            structlogger.debug(yoe_info)
        except Exception as e:
            structlogger.debug("Exception in yoeExtractor:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'yoe': 0, 'ryoe': 0}

@app.post("/getRecruitersOverview")
def getRecruitersOverview(data: dict):
    structlogger.debug("Received request for getRecruitersOverview")
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            recruiters_overview_info = recruiters_overview_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['bullets', 'relevant_experience', 'technical_proficiency']
            if isinstance(recruiters_overview_info, dict):
                if all(key in recruiters_overview_info for key in keys_to_check):
                    if isinstance(recruiters_overview_info['bullets'], list) and \
                       isinstance(recruiters_overview_info['technical_proficiency'], list):
                        return recruiters_overview_info

            structlogger.debug(recruiters_overview_info)
        except Exception as e:
            structlogger.debug("Exception in recruitersOverviewExtractor:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'bullets': [], 'relevant_experience': '', 'technical_proficiency': []}

@app.post("/getDesignation")
def getDesignation(data: dict):
    structlogger.debug("Received request for getDesignation")
    resumeText = data.get("resumeText")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            designation_info = designation_extractor_chain.invoke({"resume_text": resumeText})
            keys_to_check = ['current_designation', 'previous_designation']
            if isinstance(designation_info, dict):
                if all(key in designation_info for key in keys_to_check):
                    return designation_info

            structlogger.debug(designation_info)
        except Exception as e:
            structlogger.debug("Exception in designationExtractor:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'current_designation': '', 'previous_designation': ''}

@app.post("/assembleData")
def assembleData(data: dict):
    try:
        structlogger.debug("Received request for assembleData")
        status = insert_data(data)
        return status
    except Exception as e:
        structlogger.debug("Exception in assembleData:", details=e)
        return {"response": "Failed"}

@app.post("/processBulkImport")
def process_bulk_import(data: dict):

    try:
        structlogger.debug("Received request for processBulkImport")
        return_payload= process_individual_resume(data)
        return return_payload
    except Exception as e:
        structlogger.debug("Exception in processBulkImport:", details=e)
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
        return result

    except Exception as e:
        return {"response": "Failed to extract data", "error": "An error occurred while processing your request", "status": 500}

@app.post("/getLocation")
def get_location(data: dict):
    structlogger.debug("Received request for getLocation")
    resumeText = data.get("resumeText")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            location_info = location_extractor_chain.invoke({"resume_text": resumeText})
            keys_to_check = ['location', 'confidence_score']
            if isinstance(location_info, dict):
                if all(key in location_info for key in keys_to_check):
                    return location_info

            structlogger.debug(location_info)
        except Exception as e:
            structlogger.debug("Exception in locationExtractor:", details=e)
            pass

        structlogger.debug("Retrying. Ended Iteration:", details=iteration)    
        
    return {'location': '', 'confidence_score': 0}

@app.post("/filterCandidate")
def filter_candidate(data: dict):
    try:
        structlogger.debug("Received request for filterCandidate")
        wordList = data.get("wordList", None)
        jobRole = data.get("jobRole", None)
        jobDescription = data.get("jobDescription", None)
        experience = data.get("experienceFilter", None)
        recentResumeCount = data.get("recentResumeCount", None)
        
        return refined_resume(wordList, jobRole, jobDescription, experience, recentResumeCount)

    except Exception as e:
        structlogger.debug("Exception in filterCandidate:", details=e)
        return {"response": "Failed to filter candidate", "error": "An error occurred while processing your request", "status": 500}

@app.get("/getAllCandidates")
def get_all_candidates():
    try:
        structlogger.debug("Received request for getAllCandidates")
        candidates = extract_all_resumes()
        structlogger.debug(f"Returning {len(candidates)} candidates")
        return candidates
    except Exception as e:
        structlogger.debug("Exception in getAllCandidates:", details=e)
        return {"response": "Failed to retrieve candidates", "error": "An error occurred while processing your request", "status": 500}

@app.get("/getAllCandidatesDropdown")
def get_candidates_dropdown_api():
    try:
        structlogger.debug("Received request for getAllCandidatesDropdown")
        candidates = get_all_candidates_dropdown()
        structlogger.debug(f"Returning {len(candidates)} candidates")
        return candidates
    except Exception as e:
        structlogger.debug("Exception in getAllCandidatesDropdown:", details=e)
        return {"response": "Failed to retrieve candidates", "error": "An error occurred while processing your request", "status": 500}

@app.get("/getRefinedResume")
def getRefinedResume(data: dict):
    try:
        structlogger.debug("Received request for getRefinedResume")
        refined_resume = get_refined_resume(
            wordList = data.get("wordList", []),
            jobRole = data.get("jobRole", None),
            jobDescription = data.get("jobDescription", None),
            experience = data.get("experienceFilter", None),
            recent_resume_count = data.get("recentResumeCount", None)
            
        )
        structlogger.debug(f"Returning refined resume")
        return refined_resume
    except Exception as e:
        structlogger.debug("Exception in getRefinedResume:", details=e)
        return {"response": "Failed to retrieve refined resume", "error": "An error occurred while processing your request", "status": 500}
        

