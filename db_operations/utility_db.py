from sqlalchemy import create_engine, text
from sqlalchemy.types import JSON, Text
import pandas as pd
import time

engine = create_engine(f"postgresql+psycopg2://postgres:resume_db@localhost:5432/postgres")

def insert_data(assembled_field: dict):
    print("Got request to assmble data")

    db_colNames = ['candidate_id', 'name', 'job_role', 'resume_raw_text', 'score_resume', 'get_contacts', 'get_summary_overview', 'get_custom_scores', 
                   'get_other_comments', 'get_functional_constituent', 'get_technical_constituent', 'get_education', 'get_projects', 
                   'get_company', 'mode']
    
    json_cols = ['get_contacts', 'get_custom_scores', 'get_summary_overview', 'get_functional_constituent', 'get_other_comments', 'get_education', 'score_resume', 'get_technical_constituent', 'get_company', 'get_projects']
    
    col_mapping = {i: JSON for i in json_cols}
    col_mapping.update({
        'candidate_id': Text,
        'name': Text,
        'job_role': Text,
        'resume_raw_text': Text,
        'mode': Text
    })
    
    candidate_id = f"Candidate-{str(time.time()).split('.')[0]}"
    name = assembled_field.get("input_data", None).get("name", None)
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

    data = pd.DataFrame([[candidate_id, name, job_role, resume_text, scoreResume, getContacts, getSummaryOverview, getCustomScores, getOtherComments, getFunctionalConstituent, 
                          getTechnicalConstituent, getEducation, getProjects, getCompany, mode]], 
                       columns = db_colNames)
    
    with engine.begin() as conn:
        data.to_sql(name="resume_store", con=conn, if_exists="append", index=False, dtype=col_mapping)
        
    return {"response": "Data inserted successfully"}

