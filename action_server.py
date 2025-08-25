from typing import List
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_operations.chains import *

from db_operations.utility_db import *

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/test")
def test_endpoint():
    return {"status": "success", "message": "Server is working!"}

@app.post("/getNames")
def getNames(data: dict):
    print("Received request for getNames")
    resumeText = data.get("resumeText", "")
    email_id = data.get("email_id", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            names = name_extractor_chain.invoke({"resume_text": resumeText, "email_id": email_id})
            if isinstance(names, dict):
                if 'name' in names:
                    return names

            print(names)
        except Exception as e:
            print("Exception in getNames:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {"name": "Name Not Found"}

@app.post("/scoreResume")
def scoreResume(data: dict):
    print("Received request for scoreResume")
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

            print(scores_resume)
        except Exception as e:
            print("Exception in scoreResume:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    

    return {    
        "score": 0.1,
        "jobRole": jobRole,
        "items": []
    }
    

@app.post("/getContacts")
def getContacts(data: dict):
    print("Received request for getContacts")
    resumeText = data.get("resumeText")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            contact_info = contact_extractor_chain.invoke({"resume_text": resumeText})
            keys_to_check = ['color', 'comment', 'email_id', 'mobile_number']
            if isinstance(contact_info, dict):
                
                if all(key in contact_info for key in keys_to_check):
                    return contact_info

            print(contact_info)
        except Exception as e:
            print("Exception in contactInfo:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {    
        "color": "red",
        "comment": "Issue in Processing",
        "email_id": "",
        "mobile_number": ""
    }


@app.post("/getSummaryOverview")
def getSummaryOverview(data: dict):
    print("Received request for getSummaryOverview")
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

            print(summary_info)
        except Exception as e:
            print("Exception in summaryInfo:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {'score': 0,
            'color': 'red',
            'label': 'critical',
            'comment': 'Issue in Processing'}

@app.post("/getCustomScores")
def getCustomScores(data: dict):
    print("Received request for getCustomScores")
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

            print(custom_scores_info)
        except Exception as e:
            print("Exception in customScores:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {'searchibility_score': 0,
            'hard_skills_score': 0,
            'soft_skill_score': 0,
            'formatting_score': 0}

@app.post("/getOtherComments")
def getOtherComments(data: dict):
    print("Received request for getOtherComments")
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

            print(other_comments_info)
        except Exception as e:
            print("Exception in otherComments:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {'headings_feedback': '',
            'title_match': '',
            'formatting_feedback': ''}

@app.post("/getFunctionalConstituent")
def getFunctionalConstituent(data: dict):
    print("Received request for getFunctionalConstituent")
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

            print(functional_constituent_info)
        except Exception as e:
            print("Exception in functionalConstituent:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {'constituent': '',
            'industries': '', 
            'has_industry_experience': '',
            'has_completed_college': ''}

@app.post("/getTechnicalConstituent")
def getTechnicalConstituent(data: dict):
    print("Received request for getTechnicalConstituent")
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

            print(technical_constituent_info)
        except Exception as e:
            print("Exception in technicalConstituent:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {'technical_exposure': ''}

@app.post("/generateCoverLetter")
def generateCoverLetter(data: dict):
    print("Received request for generateCoverLetter")
    resumeText = data.get("resumeText")
    description = data.get("description", "")
    
    try:
        # Simple cover letter generation logic
        # In a real implementation, you would use an AI model here
        sample_cover_letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the position at your esteemed organization. Based on your requirements: {description}

With my background and experience as outlined in my resume, I am confident that I can contribute effectively to your team. My skills and expertise align well with the role requirements, and I am excited about the opportunity to bring my passion and dedication to your organization.

I have extensive experience in various domains and have successfully delivered multiple projects that demonstrate my technical capabilities and problem-solving skills. I am particularly drawn to this opportunity because it aligns with my career goals and allows me to leverage my expertise in a meaningful way.

Thank you for considering my application. I look forward to the opportunity to discuss how my background and enthusiasm can contribute to your team's success.

Sincerely,
Applicant"""
        
        return {'coverLetter': sample_cover_letter}
    except Exception as e:
        print("Exception in generateCoverLetter:", e)
        return {'error': 'Failed to generate cover letter'}, 500

@app.post("/getEducation")
def getEducation(data: dict):
    print("Received request for getEducation")
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
    
            print(education_info)
        except Exception as e:
            print("Exception in educationExtractor:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {'education_history': []}

@app.post("/getProjects")
def getProjects(data: dict):
    print("Received request for getProjects")
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
    
            print(project_info)
        except Exception as e:
            print("Exception in projectExtractor:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {'projects': []}
        
@app.post("/getCompany")
def getCompany(data: dict):
    print("Received request for getCompany")
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
    
            print(company_info)
        except Exception as e:
            print("Exception in companyExtractor:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return {'employment_history': []}



@app.post("/assembleData")
def assembleData(data: dict):
    try:
        print("Received request for assembleData")
        status = insert_data(data)
        return status
    except Exception as e:
        print("Exception in assembleData:", e)
        return {"response": "Failed to assemble data"}


@app.post("/processBulkImport")
def process_bulk_import(data: dict):

    try:
        print("Received request for processBulkImport")
        return_payload= process_individual_resume(data)
        return return_payload
    except Exception as e:
        print("Exception in processBulkImport:", e)
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
        print("Received request for extractData")
        print("Request data:", data, type(data))
        email_id = data.get("email_id", None)
        print("Email ID:", email_id)
        
        return_payload = extract_data(email_id)
        print("Database query result type:", type(return_payload))
        print("Database query result length:", len(return_payload))
        
        # Check if the return payload indicates no candidate was found
        if len(return_payload) == 0:
            print("No candidate found in database")
            return {"response": "Candidate not found", "error": "Relevant Candidate Not Found", "status": 404}
        
        # Return the first candidate
        result = return_payload[0]
        print("Returning candidate data with keys:", result.keys() if isinstance(result, dict) else "Not a dictionary")
        return result

    except Exception as e:
        print("Exception in extractData:", e)
        return {"response": "Failed to extract data", "error": "An error occurred while processing your request", "status": 500}



