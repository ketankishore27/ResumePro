from sqlalchemy import create_engine, text
from sqlalchemy.types import JSON, Text, Integer, Float
from sqlalchemy import text
import pandas as pd
import time
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
from ai_operations.utility_function import refined_search_results
import httpx
import asyncio
import structlog

structlogger = structlog.get_logger(__name__)
load_dotenv()

engine = create_engine(f"postgresql+psycopg2://postgres:resume_db@localhost:5432/postgres")

def insert_data(assembled_field: dict):

    table_name = os.getenv("TABLE_NAME", None)

    db_colNames = ['candidate_id', 'name', 'job_role', 'resume_raw_text', 'email_id', 'mobile_number', 'get_yoe', 
                   'get_ryoe', 'score_resume', 'get_contacts', 'get_summary_overview', 'get_custom_scores', 
                   'get_other_comments', 'get_functional_constituent', 'get_technical_constituent', 'get_education', 'get_projects', 
                   'get_company', 'get_location', 'get_recruiters_overview', 'get_designation', 'mode']
    
    json_cols = ['get_contacts', 'get_custom_scores', 'get_summary_overview', 'get_functional_constituent', 
                 'get_other_comments', 'get_education', 'score_resume', 'get_technical_constituent', 
                 'get_company', 'get_projects', 'get_location', 'get_recruiters_overview', 'get_designation']
    
    col_mapping = {i: JSON for i in json_cols}
    col_mapping.update({
        'candidate_id': Text,
        'name': Text,
        'email_id': Text,
        'mobile_number': Text,
        'job_role': Text,
        'resume_raw_text': Text,
        'mode': Text,
        'get_yoe': Float,
        'get_ryoe': Float
    })
    
    candidate_id = f"Candidate-{str(time.time()).split('.')[0]}"
    name = assembled_field.get("input_data", None).get("name", None)
    email_id = assembled_field.get("getContacts", None).get("email_id", None)
    mobile_number = assembled_field.get("getContacts", None).get("mobile_number", None)
    job_role = assembled_field.get("input_data", None).get("job_role", None)
    resume_text = assembled_field.get("input_data", None).get("resume_text", None)
    yoe = assembled_field.get("getYoe", None)
    ryoe = assembled_field.get("getRyoe", None)
    mode = assembled_field.get("mode", None)
    
    if any(ent is None for ent in [name, job_role, resume_text]):
        return {"response": "Name/Job-Role/Resume cant be None"}
        
    getContacts = assembled_field.get("getContacts", None)
    getCustomScores = assembled_field.get("getCustomScores", None)
    getSummaryOverview = assembled_field.get("getSummaryOverview", None)
    getFunctionalConstituent = assembled_field.get("getFunctionalConstituent", None)
    getOtherComments = assembled_field.get("getOtherComments", None)
    getEducation = assembled_field.get("getEducation", None)
    scoreResume = assembled_field.get("scoreResume", None)
    getTechnicalConstituent = assembled_field.get("getTechnicalConstituent", None)
    yoe = assembled_field.get("getYoe", None)
    ryoe = assembled_field.get("getRyoe", None)
    getlocation = assembled_field.get("getLocation", None)
    getRecruitersOverview = assembled_field.get("getRecruitersOverview", None)
    getDesignation = assembled_field.get("getDesignation", None)

    ## Temp Fix
    if not isinstance(assembled_field.get("getProjects", None), dict):
        getProjects = {"projects": assembled_field.get("getProjects", None)}
    else:
        getProjects = assembled_field.get("getProjects", None)
        
    if not isinstance(assembled_field.get("getCompany", None), dict):
        getCompany = {"employment_history": assembled_field.get("getCompany", None)}
    else:
        getCompany = assembled_field.get("getCompany", None)
    ##

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    data = pd.DataFrame([[candidate_id, name, job_role, resume_text, email_id, mobile_number, yoe, ryoe, scoreResume, getContacts, getSummaryOverview, getCustomScores, getOtherComments, getFunctionalConstituent, 
                          getTechnicalConstituent, getEducation, getProjects, getCompany, getlocation, getRecruitersOverview, getDesignation, mode]], 
                       columns = db_colNames)

    with engine.begin() as conn:
        # Check for existing primary key
        result = conn.execute(text(f"select COUNT(*) from {table_name} where email_id = '{email_id}'"))
        if result.scalar() > 0:
            conn.execute(text(f"delete from {table_name} where email_id = '{email_id}'"))

        data.to_sql(name=table_name, con=conn, if_exists="append", index=False, dtype=col_mapping)
        
    return {"response": "Data inserted successfully"}

def sanitize_data(data, remove_chars=None, strip_whitespace=False, normalize_none=False):
    """
    Recursively sanitize data by removing problematic characters from strings.
    
    Args:
        data: The data structure to sanitize (dict, list, str, or primitive)
        remove_chars: String or list of characters/byte sequences to remove (default: ['\\x00'])
        strip_whitespace: If True, strip leading/trailing whitespace from strings
        normalize_none: If True, convert empty strings to None
    
    Returns:
        Sanitized data with the same structure as input
    """
    # Default problematic characters
    if remove_chars is None:
        remove_chars = ['\x00']  # NUL byte
    elif isinstance(remove_chars, str):
        remove_chars = [remove_chars]
    
    if isinstance(data, dict):
        return {k: sanitize_data(v, remove_chars, strip_whitespace, normalize_none) 
                for k, v in data.items()}
    
    elif isinstance(data, list):
        return [sanitize_data(item, remove_chars, strip_whitespace, normalize_none) 
                for item in data]
    
    elif isinstance(data, str):
        # Remove problematic characters
        cleaned = data
        for char in remove_chars:
            cleaned = cleaned.replace(char, '')
        
        # Optional whitespace stripping
        if strip_whitespace:
            cleaned = cleaned.strip()
        
        # Optional None normalization
        if normalize_none and not cleaned:
            return None
            
        return cleaned
    
    else:
        # Return primitives (int, float, bool, None) unchanged
        return data

async def process_individual_resume(data: dict):

    final_payload = {}
    return_payload = {}

    headers = {
        "Content-Type": "application/json"
    }
    
    base_url = "http://127.0.0.1:8000"

    async with httpx.AsyncClient(timeout=60) as client:
        task = [
            client.post(f"{base_url}/getContacts", json=data, headers=headers),
            client.post(f"{base_url}/getNames", json=data, headers=headers),
            client.post(f"{base_url}/getCustomScores", json=data, headers=headers),
            client.post(f"{base_url}/getSummaryOverview", json=data, headers=headers),
            client.post(f"{base_url}/getFunctionalConstituent", json=data, headers=headers),
            client.post(f"{base_url}/getOtherComments", json=data, headers=headers),
            client.post(f"{base_url}/getEducation", json=data, headers=headers),
            client.post(f"{base_url}/scoreResume", json=data, headers=headers),
            client.post(f"{base_url}/getTechnicalConstituent", json=data, headers=headers),
            client.post(f"{base_url}/getCompany", json=data, headers=headers),
            client.post(f"{base_url}/getProjects", json=data, headers=headers),
            client.post(f"{base_url}/getYoe", json=data, headers=headers),
            client.post(f"{base_url}/getLocation", json=data, headers=headers),
            client.post(f"{base_url}/getRecruitersOverview", json=data, headers=headers),
            client.post(f"{base_url}/getDesignation", json=data, headers=headers)
        ]

        responses = await asyncio.gather(*task, return_exceptions=True)

    try:
        get_contact_information = {"getContacts": responses[0].json()}
        data["email_id"] = get_contact_information.get("getContacts", None).get("email_id", None)
        return_payload["email_id"] = get_contact_information.get("getContacts", None).get("email_id", None)
        return_payload["contact_number"] = get_contact_information.get("getContacts", None).get("mobile_number", None)

        get_name = responses[1].json()
        return_payload["name"] = get_name.get("name", None)

        get_custom_scores = {"getCustomScores": responses[2].json() if not isinstance(responses[2], Exception) else {}}
        get_summary_overview = {"getSummaryOverview": responses[3].json() if not isinstance(responses[3], Exception) else {}}
        return_payload["summary_overview"] = get_summary_overview.get("getSummaryOverview", {}).get("comment", None)
        
        get_functional_constituent = {"getFunctionalConstituent": responses[4].json() if not isinstance(responses[4], Exception) else {}}
        get_other_comments = {"getOtherComments": responses[5].json() if not isinstance(responses[5], Exception) else {}}
        get_education = {"getEducation": responses[6].json() if not isinstance(responses[6], Exception) else {}}
        
        get_score_resume = {"scoreResume": responses[7].json() if not isinstance(responses[7], Exception) else {}}
        return_payload["score_resume"] = get_score_resume.get("scoreResume", None)
        
        get_technical_constituent = {"getTechnicalConstituent": responses[8].json() if not isinstance(responses[8], Exception) else {}}
        get_comapny = {"getCompany": responses[9].json() if not isinstance(responses[9], Exception) else {}}
        get_project = {"getProjects": responses[10].json() if not isinstance(responses[10], Exception) else {}}
        get_data = {"job_role": data.get('jobRole', None), "resume_text": data.get('resumeText', None)}
        
        exp_params = responses[11].json() if not isinstance(responses[11], Exception) else {}
        get_yoe = {'getYoe': exp_params.get("yoe", None)}
        get_ryoe = {'getRyoe': exp_params.get("ryoe", None)}
        
        get_location = {"getLocation": responses[12].json() if not isinstance(responses[12], Exception) else {}}
        get_recruiters_overview = {"getRecruitersOverview": responses[13].json() if not isinstance(responses[13], Exception) else {}}
        get_designation = {"getDesignation": responses[14].json() if not isinstance(responses[14], Exception) else {}}

    except Exception as e:
        print(f"Error parsing responses at line {e.__traceback__.tb_lineno}: {e}")
        return {"email_id": "", "contact_number": "", "name": "", "parsed_status": "UnSuccessful"}
    
    input_data = {"input_data": {**get_name, **get_data}}
    get_mode = {"mode": "batch"}
    
    structlogger.debug("Creating finalPayload for database sync", details = get_name.get("name", None))
    final_payload = {**input_data, **get_contact_information, **get_custom_scores, **get_summary_overview, 
                     **get_functional_constituent, **get_other_comments, **get_education, **get_score_resume, 
                     **get_technical_constituent, **get_comapny, **get_project, **get_yoe, **get_ryoe, 
                     **get_recruiters_overview, **get_designation, **get_location, **get_mode}
    
    # More aggressive sanitization with whitespace normalization
    final_payload = sanitize_data(
        final_payload, 
        remove_chars=['\x00', '\ufffd'],  # Remove NUL and replacement characters
        strip_whitespace=True
    )

    structlogger.debug(f"{data.get('request_type', None)}")
    
    if not data.get('request_type', None):
        async with httpx.AsyncClient(timeout=60) as client:
            status = await client.post("http://127.0.0.1:8000/assembleData", json=final_payload, headers=headers)
            structlogger.debug(f"Synced Profile in DB for {get_name.get("name", None)}")
    
    final_payload["parsed_status"] = "Successful"
    return final_payload
    
def extract_data(email_id):

    TABLE_NAME = os.getenv("TABLE_NAME", None)
    sql_query = f"select * from {TABLE_NAME} where email_id = '{email_id}'"
    data = pd.read_sql(sql_query, engine)\
             .drop(columns = ['candidate_id', 'mode', 'resume_raw_text']).to_dict("records")
    return data

def extract_all_resumes():
    base_sql = "select * from resume_store"
    df = pd.read_sql(base_sql, engine)\
             .drop(columns = ['candidate_id', 'mode', 'resume_raw_text'])
    
    # Convert to dict and replace NaN with None for proper JSON serialization
    data = df.to_dict("records")
    
    # Replace NaN values with None in the resulting dictionaries
    import math
    for record in data:
        for key, value in record.items():
            if isinstance(value, float) and math.isnan(value):
                record[key] = None
    
    return data

def refined_resume(wordList = [], jobRole = None, jobDescription = None, experience = None, recent_resume_count = None):

    structlogger.info("jobDescription: ", details=jobDescription[:50] + "...")
    structlogger.info("Experience: ", details=experience)
    structlogger.info("Recent Resume Count: ", details=recent_resume_count)

    base_sql = "select * from resume_store"

    if len(wordList) > 0:
        
        if base_sql.strip().endswith("resume_store"):
            base_sql += " where ("
        
        if base_sql.strip().endswith("or"):
            base_sql = base_sql.strip(" or ") + " and "

        structlogger.info("Processing wordList: ", details=wordList)
        for word in wordList:
            base_sql += f"resume_raw_text ILIKE '%{word}%' or "

        base_sql = base_sql.strip(" or ") + ")"

    structlogger.info("Base SQL after wordList: ", details=base_sql)

    if jobRole:
        
        if base_sql.strip().endswith("resume_store"):
            base_sql += " where "
        
        elif base_sql.strip().endswith("or"):
            base_sql = base_sql.strip(" or ") + " and "
            
        else:
            base_sql += " and "
            
        structlogger.info("Processing jobRole: ", details=jobRole)
        base_sql += f"lower(job_role) = '{jobRole.lower()}'"

    structlogger.info("Base SQL after jobRole: ", details=base_sql)

    if experience:

        if base_sql.strip().endswith("resume_store"):
            base_sql += " where "
        
        elif base_sql.strip().endswith("or"):
            base_sql = base_sql.strip(" or ") + " and "

        else:
            base_sql += " and "

        structlogger.info("Processing experience: ", details=experience)
        exp_level = experience.replace("<", "").replace(">", "")\
                                .replace("=", "").replace("Years", "")\
                              .replace(" ", "").strip().split("and")\

        start_exp = int(exp_level[0])
        end_exp = int(exp_level[1])
        base_sql += f"get_yoe between {start_exp} and {end_exp}"

    structlogger.info("Base SQL after experience: ", details=base_sql)

    if recent_resume_count:
        base_sql += " order by created_at desc limit {}".format(recent_resume_count)

    structlogger.info("Base SQL: ", details=base_sql)

    data = pd.read_sql(text(base_sql), engine)\
             .drop(columns = ['candidate_id', 'mode']).to_dict("records")

    if jobDescription is not None and len(jobDescription.strip()) > 10:
        data_refined = refined_search_results(data, jobDescription, num_results=recent_resume_count if recent_resume_count else 10)
        return data_refined
    else:
        # Sort by resume score in descending order when no job description
        data_sorted = sorted(data, key=lambda x: x.get('score_resume', {}).get('score', 0), reverse=True)
        return data_sorted

def get_all_candidates_dropdown():
    
    base_sql = "select distinct name, email_id from resume_store"
    data = pd.read_sql(base_sql, engine).to_dict("records")

    candidates = []
    for entity in data:
        name = entity.get("name", None)
        email_id = entity.get("email_id", None)
        sample_name = name + " - " + email_id
        candidates.append(sample_name)

    return candidates
    
