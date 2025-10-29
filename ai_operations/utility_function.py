from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field, RootModel, conint
from langchain_core.output_parsers import PydanticOutputParser, JsonOutputParser
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI, AzureChatOpenAI
from enum import Enum
from typing import Dict, List, Union, Literal, Optional
from datetime import datetime
from ai_operations.utils import load_prompt
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import numpy as np
import pandas as pd
load_dotenv(override=True)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.)
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
#llm = ChatOpenAI(model="gpt-4o", temperature=0.)
#llm = AzureChatOpenAI(model="gpt-4o-mini", api_version="2025-04-01-preview")


def create_resume_score():

    class ResumeScore(BaseModel):
    
        score: int = Field("Overall score of the resume, an Applicant Tracking System would give to the resume.")
        items: list[str] = Field("Pointwise, very crisp and concise suggestions for improvement in the resume.", min_items=1, max_items=7)

    output_format = PydanticOutputParser(pydantic_object = ResumeScore).get_format_instructions()
    
    instruction_prompt = load_prompt(prompt_name = "create_resume_score", filename = "prompts.yml")

    scoring_prompt = PromptTemplate.from_template(template=instruction_prompt, 
                                              partial_variables = {"format_instructions": output_format})

    chain = scoring_prompt | llm | JsonOutputParser()
    
    return chain


def get_contact_information():

    class contact_extractor(BaseModel):

        color: str = Field("`'green'` if both mobile number and email id are present, otherwise `'red'`")
        comment: str = Field("What is missing in the resume, mobile number or email? If both are present, return a positive message")
        email_id: str = Field("Extracted email id, If Email id is not present, then return blank space")
        mobile_number: str = Field("Extracted mobile number, If mobile number is not present, then return blank space")

    output_parser = PydanticOutputParser(pydantic_object = contact_extractor).get_format_instructions()
    
    instruction_format = load_prompt(prompt_name = "get_contact_information", filename = "prompts.yml")

    prompt_template = PromptTemplate.from_template(template = instruction_format, 
                                                   partial_variables={"output_information": output_parser})

    chain = prompt_template | llm | JsonOutputParser()

    return chain


def get_summary_overview():

    class ResumeSummaryScore(BaseModel):
        summary: List[str] = Field(..., description="List of bullet points extracted from the summary section")
        score: conint(ge=0, le=100) = Field(..., description="Integer score between 0 and 100")
        label: Literal["critical", "warning", "good"] = Field(..., description="Label based on score range")
        color: Literal["red", "orange", "green"] = Field(..., description="Color indicating severity level")
        comment: str = Field(..., description="Short justification for the score")

    output_parser = PydanticOutputParser(pydantic_object = ResumeSummaryScore).get_format_instructions()
    
    instruction_format = load_prompt(prompt_name = "get_summary_overview", filename = "prompts.yml")

    prompt_template = PromptTemplate.from_template(template = instruction_format, 
                                                   partial_variables={"output_information": output_parser})

    chain = prompt_template | llm | JsonOutputParser()

    return chain


def get_custom_scores():

    class custom_scores(BaseModel):
        searchibility_score: int = Field("How well the resume is optimized for ATS systems and keyword-rich")
        hard_skills_score: int = Field("Relevance and presence of technical/domain-specific skills")
        soft_skill_score: int = Field("Presence of communication, leadership, teamwork, adaptability, etc.")
        formatting_score: int = Field("Visual clarity, structure, readability, and professional layout")

    output_parser = PydanticOutputParser(pydantic_object=custom_scores).get_format_instructions()
    
    instructions_format = load_prompt(prompt_name = "get_custom_scores", filename = "prompts.yml")

    prompt_instruction = PromptTemplate.from_template(template=instructions_format, 
                                                      partial_variables={"output_format": output_parser})

    chain = prompt_instruction | llm | JsonOutputParser()

    return chain


def get_other_comments():

    class AspectFeedback(BaseModel):
        score: conint(ge=0, le=100) = Field(..., description="Score between 0 and 100")
        comment: str = Field(..., description="1–2 line feedback")

    class ResumeReview(BaseModel):
        headings_feedback: AspectFeedback
        title_match: AspectFeedback
        formatting_feedback: AspectFeedback
    
    output_parser = PydanticOutputParser(pydantic_object=ResumeReview).get_format_instructions()
        
    instruction_format = load_prompt(prompt_name = "get_other_comments", filename = "prompts.yml")

    prompt_template = PromptTemplate.from_template(template=instruction_format,
                                                   partial_variables={"output_format": output_parser})

    chain = prompt_template | llm | JsonOutputParser()

    return chain


def functional_constituent():

    class IndustryEnum(str, Enum):
        IT = "IT"
        Telecom = "Telecom"
        Banking = "Banking"
        Insurance = "Insurance"
        Healthcare = "Healthcare"
        Retail = "Retail"
        Manufacturing = "Manufacturing"
        Logistics = "Logistics"
        Education = "Education"
        Consulting = "Consulting"
        Ecommerce = "E-commerce"
        Government = "Government"
        RealEstate = "Real Estate"
        Energy = "Energy"
        Hospitality = "Hospitality"
        Aerospace = "Aerospace"
        Automotive = "Automotive"
        Media = "Media"
        Agriculture = "Agriculture"
        Construction = "Construction"
        Other = "Other"
        
    class FunctionalExposure(BaseModel):
        has_industry_experience: bool = Field(description="True if the candidate has any relevant work experience (including internships); else False")
        has_completed_college: bool = Field(description="True if the candidate has finished their college education; else False")
        constituent: Dict[str, str] = Field(default_factory=dict, description="Industry-to-percentage mapping based on functional exposure (e.g., {'Telecom': '40%'}). Must sum to 100%.")
        industries: List[str] = Field(default_factory=list, description="List of industries the candidate has worked in or been exposed to")
    
    output_parser = PydanticOutputParser(pydantic_object=FunctionalExposure).get_format_instructions()
    
    instruction_format = load_prompt(prompt_name = "functional_constituent", filename = "prompts.yml")

    prompt_template = PromptTemplate.from_template(template=instruction_format,
                                                   partial_variables = {"output_format": output_parser})

    chain = prompt_template | llm | JsonOutputParser()

    return chain


def technical_constituent():

    class TechnicalExposureGrouped(BaseModel):
        high: List[str]
        medium: List[str]
        low: List[str]
        
    output_parser = PydanticOutputParser(pydantic_object=TechnicalExposureGrouped).get_format_instructions()
    
    instruction_format = load_prompt(prompt_name = "technical_constituent", filename = "prompts.yml")

    prompt_template = PromptTemplate.from_template(template=instruction_format, 
                                                   partial_variables={"output_format": output_parser})

    chain = prompt_template | llm | JsonOutputParser()
    
    return chain

    
def education_extractor():

    class EducationEntry(BaseModel):
        degree: str
        institution: str
        start_year: int
        end_year: Union[int, str]  # Can be an integer (year) or "ongoing"
    
    class EducationHistory(RootModel[List[EducationEntry]]):
        pass
        
    
    output_parser = PydanticOutputParser(pydantic_object=EducationHistory).get_format_instructions()
    
    instruction_format = load_prompt(prompt_name = "education_extractor", filename = "prompts.yml")

    prompt_template = PromptTemplate.from_template(template=instruction_format, 
                                                   partial_variables={"output_format": output_parser})

    chain = prompt_template | llm | JsonOutputParser()
    
    return chain


def project_extractor():

    class Project(BaseModel):
        title: str
        description: str = Field(default="")
        technologies: List[str] = Field(default_factory=list)
        score: conint(ge=0, le=100)
        color: Literal["light red", "light orange", "light green"]
        comment: str
        stage: Literal["POC", "Production", "Intern"]


    class ProjectEvaluationResult(BaseModel):
        projects: List[Project] = Field(default_factory=list)

    output_parser = PydanticOutputParser(pydantic_object=ProjectEvaluationResult).get_format_instructions()

    instruction_format = load_prompt(prompt_name = "project_extractor", filename = "prompts.yml")

    prompt = PromptTemplate.from_template(template=instruction_format, 
                                     partial_variables={"output_format": output_parser})

    chain = prompt | llm | JsonOutputParser()

    return chain


def company_extractor():

    class EmploymentEntry(BaseModel):
        company: str = Field(..., description="Name of the company or organization")
        position: str = Field(..., description="Role or job title held by the candidate")
        start_year: int = Field(..., ge=1900, le=2100, description="4-digit year of job start")
        end_year: Union[int, Literal["Currently Working"]] = Field(
            ..., description="4-digit year of job end or 'Currently Working'"
        )
        employment_type: Literal[
            "Permanent", "Intern", "Part Time", "Contractual", "Non Permanent"
        ] = Field(..., description="Type of employment")

    class EmploymentHistory(BaseModel):
        employment_history: List[EmploymentEntry]

    
    output_parser = PydanticOutputParser(pydantic_object=EmploymentHistory).get_format_instructions()
        
    instruction_format = load_prompt(prompt_name = "company_extractor", filename = "prompts.yml")

    prompt = PromptTemplate.from_template(template=instruction_format, 
                                          partial_variables = {"output_format": output_parser})

    chain = prompt | llm | JsonOutputParser()

    return chain


def extract_names():

    class ResumeName(BaseModel):
        name: str = Field("Name of the person mentioned in resume")

    output_parser = PydanticOutputParser(pydantic_object=ResumeName)
    
    instruction_format = load_prompt(prompt_name = "extract_names", filename = "prompts.yml")

    prompt = PromptTemplate.from_template(template=instruction_format, 
                            partial_variables={"output_format": output_parser})

    chain = prompt | llm | JsonOutputParser()

    return chain


def extract_yoe():

    class ExperienceSummary(BaseModel):
        yoe: float = Field(..., description="Total years of corporate experience, rounded to 1 decimal place")
        ryoe: float = Field(..., description="Relevant years of experience with respect to the job role, rounded to 1 decimal place")

    summary_output = PydanticOutputParser(pydantic_object = ExperienceSummary).get_format_instructions()
    
    instruction_format = load_prompt(prompt_name = "extract_yoe", filename = "prompts.yml")

    prompt = PromptTemplate.from_template(template=instruction_format, 
                                          partial_variables={
                                              "current_date": str(datetime.now().date()),
                                              "output_format": summary_output
                                          })

    chain = prompt | llm | JsonOutputParser()

    return chain


def extract_recruiters_overview():

    class RecruiterOverview(BaseModel):
        bullets: List[str] = Field(description="List of recruiter-friendly bullet points summarizing the candidate's skills, experience, and traits.")
        relevant_experience: str = Field(description="A line summarizing the candidate’s relevant years of experience.")
        technical_proficiency: List[str] = Field(description="Detailed technical proficiencies, grouped by technology or domain area.")

    overview_format = PydanticOutputParser(pydantic_object=RecruiterOverview).get_format_instructions()
    
    instruction_format = load_prompt(prompt_name = "extract_recruiters_overview", filename = "prompts.yml")

    prompt = PromptTemplate.from_template(template = instruction_format,
                                          partial_variables = {
                                              "current_date": str(datetime.now().date()),
                                              "output_format": overview_format
                                          })

    chain = prompt | llm | JsonOutputParser()

    return chain


def extract_location():

    class CandidateLocation(BaseModel):
        location: str = Field(..., description="Predicted location of the candidate (city/state/country)")
        confidence_score: float = Field(..., ge=0, le=100, description="Confidence score of the predicted location between 0 and 100")

    location_format = PydanticOutputParser(pydantic_object = CandidateLocation).get_format_instructions()

    instruction_format = load_prompt(prompt_name = "extract_location", filename = "prompts.yml")

    prompt = PromptTemplate.from_template(template = instruction_format,
                                          partial_variables={
                                              "output_format": location_format
                                          })
    
    chain = prompt | llm | JsonOutputParser()

    return chain


def designation_extractor():

    class DesignationResponse(BaseModel):
        current_designation: Optional[str] = Field(None, description="The candidate's most recent or current job title. Null if not found.")
        previous_designation: Optional[str] = Field(None, description="The candidate's immediate past job title before the current one. Null if not found.")

    
    designation_output = PydanticOutputParser(pydantic_object=DesignationResponse).get_format_instructions()
    
    instruction_format = load_prompt(prompt_name = "designation_extractor", filename = "prompts.yml")

    prompt = PromptTemplate.from_template(template=instruction_format, 
                                          partial_variables={
                                              "output_format": designation_output
                                          })

    chain = prompt | llm | JsonOutputParser()

    return chain


def create_similarity_score(job_description_emb, recruiter_overview_emb):

    dot_product = np.dot(job_description_emb, recruiter_overview_emb)
    magnitude_jd = np.linalg.norm(job_description_emb)
    magnitude_ro = np.linalg.norm(recruiter_overview_emb)

    similarity_score = dot_product / (magnitude_jd * magnitude_ro)
    return similarity_score


def refined_search_results(data, jobDescription, num_results=10):
    
    name_list, overview_list, resume_score_list = [], [], []
    for candidate in data:
        name_list.append(candidate['name'])
        overview = candidate['get_recruiters_overview']['bullets']
        overview_str = " ".join(overview)
        overview_list.append(overview_str)
        resume_score_list.append(candidate['score_resume']['score'])

    overview_emb = embeddings.embed_documents(overview_list)
    jobDescription_emb = embeddings.embed_query(jobDescription)

    final_list = []
    for idx, name in enumerate(name_list):
        final_list.append([name, overview_list[idx], round(create_similarity_score(jobDescription_emb, overview_emb[idx]), 3), ])
        
    final_list.sort(key = lambda x: x[2], reverse=True)
    final_list = final_list[:num_results]
    name_list_desc = [name for name, _, _ in final_list]

    # Get all the required data for candidates
    df = pd.DataFrame.from_records(data)
    df = df[df['name'].isin(name_list_desc)]
    
    # Sort by resume score in descending order
    df['resume_score'] = df['score_resume'].apply(lambda x: x.get('score', 0) if isinstance(x, dict) else 0)
    df = df.sort_values(by='resume_score', ascending=False).drop(columns=['resume_score'])
    
    return df.to_dict("records")

