from sqlalchemy import create_engine, text
from sqlalchemy.types import JSON, Text
import pandas as pd
import time
import requests
import os
from dotenv import load_dotenv
load_dotenv()

engine = create_engine(f"postgresql+psycopg2://postgres:resume_db@localhost:5432/postgres")


def insert_data(assembled_field: dict):
    print("Got request to assmble data")

    table_name = os.getenv("TABLE_NAME", None)

    db_colNames = ['candidate_id', 'name', 'job_role', 'resume_raw_text', 'email_id', 'mobile_number', 'score_resume', 'get_contacts', 'get_summary_overview', 'get_custom_scores', 
                   'get_other_comments', 'get_functional_constituent', 'get_technical_constituent', 'get_education', 'get_projects', 
                   'get_company', 'mode']
    
    json_cols = ['get_contacts', 'get_custom_scores', 'get_summary_overview', 'get_functional_constituent', 'get_other_comments', 'get_education', 'score_resume', 'get_technical_constituent', 'get_company', 'get_projects']
    
    col_mapping = {i: JSON for i in json_cols}
    col_mapping.update({
        'candidate_id': Text,
        'name': Text,
        'email_id': Text,
        'mobile_number': Text,
        'job_role': Text,
        'resume_raw_text': Text,
        'mode': Text
    })
    
    candidate_id = f"Candidate-{str(time.time()).split('.')[0]}"
    name = assembled_field.get("input_data", None).get("name", None)
    email_id = assembled_field.get("getContacts", None).get("email_id", None)
    mobile_number = assembled_field.get("getContacts", None).get("mobile_number", None)
    job_role = assembled_field.get("input_data", None).get("job_role", None)
    resume_text = assembled_field.get("input_data", None).get("resume_text", None)
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
    getCompany = assembled_field.get("getCompany", None)
    getProjects = assembled_field.get("getProjects", None)

    data = pd.DataFrame([[candidate_id, name, job_role, resume_text, email_id, mobile_number, scoreResume, getContacts, getSummaryOverview, getCustomScores, getOtherComments, getFunctionalConstituent, 
                          getTechnicalConstituent, getEducation, getProjects, getCompany, mode]], 
                       columns = db_colNames)

    with engine.begin() as conn:
        # Check for existing primary key
        result = conn.execute(text(f"select COUNT(*) from {table_name} where email_id = '{email_id}'"))
        if result.scalar() > 0:
            conn.execute(text(f"delete from {table_name} where email_id = '{email_id}'"))

        data.to_sql(name=table_name, con=conn, if_exists="append", index=False, dtype=col_mapping)
        
    return {"response": "Data inserted successfully"}


def process_individual_resume(data: dict):

    final_payload = {}
    return_payload = {}

    headers = {
        "Content-Type": "application/json",
        "Authorization": None # If authentication is required
    }
    
    get_contact_information = {"getContacts": requests.post("http://127.0.0.1:8000/getContacts", json = data, headers=headers).json()}
    data["email_id"] = get_contact_information.get("getContacts", None).get("email_id", None)
    return_payload["email_id"] = get_contact_information.get("getContacts", None).get("email_id", None)
    return_payload["contact_number"] = get_contact_information.get("getContacts", None).get("mobile_number", None)
    get_name = requests.post("http://127.0.0.1:8000/getNames", json = data, headers=headers).json()
    return_payload["name"] = get_name.get("name", None)
    get_custom_scores = {"getCustomScores": requests.post("http://127.0.0.1:8000/getCustomScores", json = data, headers=headers).json()}
    get_summary_overview = {"getSummaryOverview": requests.post("http://127.0.0.1:8000/getSummaryOverview", json = data, headers=headers).json()}
    return_payload["summary_overview"] = get_summary_overview.get("getSummaryOverview", None).get("comment", None)
    get_functional_constituent = {"getFunctionalConstituent": requests.post("http://127.0.0.1:8000/getFunctionalConstituent", json = data, headers=headers).json()}
    get_other_comments = {"getOtherComments": requests.post("http://127.0.0.1:8000/getOtherComments", json = data, headers=headers).json()}
    get_education = {"getEducation": requests.post("http://127.0.0.1:8000/getEducation", json = data, headers=headers).json()}
    get_score_resume = {"scoreResume": requests.post("http://127.0.0.1:8000/scoreResume", json = data, headers=headers).json()}
    return_payload["score_resume"] = get_score_resume.get("scoreResume", None)
    get_technical_constituent = {"getTechnicalConstituent": requests.post("http://127.0.0.1:8000/getTechnicalConstituent", json = data, headers=headers).json()}
    get_comapny = {"getCompany": requests.post("http://127.0.0.1:8000/getCompany", json = data, headers=headers).json()}
    get_project = {"getProjects": requests.post("http://127.0.0.1:8000/getProjects", json = data, headers=headers).json()}
    get_data = {"job_role": data.get('jobRole', None), "resume_text": data.get('resumeText', None)}
    input_data = {"input_data": {**get_name, **get_data}}
    get_mode = {"mode": "batch"}
    final_payload = {**input_data, **get_contact_information, **get_custom_scores, **get_summary_overview, **get_functional_constituent, **get_other_comments, 
                     **get_education, **get_score_resume, **get_technical_constituent, **get_comapny, **get_project, **get_mode}

    status = requests.post("http://127.0.0.1:8000/assembleData", json = final_payload, headers=headers)
    return_payload["parsed_status"] = "Successful"

    return return_payload

def extract_data(email_id):

    TABLE_NAME = os.getenv("TABLE_NAME", None)
    sql_query = f"select * from {TABLE_NAME} where email_id = '{email_id}'"
    data = pd.read_sql(sql_query, engine).to_dict("records")[0]
    return data
