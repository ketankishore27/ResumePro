from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser, JsonOutputParser
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

load_dotenv(override=True)
#llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.)
llm = ChatOpenAI(model="gpt-4o", temperature=0.)

def create_resume_score():

    class ResumeScore(BaseModel):
    
        score: int = Field("Overall score of the resume, an Applicant Tracking System would give to the resume.")
        items: list[str] = Field("Pointwise, very crisp and concise suggestions for improvement in the resume.", min_items=1, max_items=7)

    output_format = PydanticOutputParser(pydantic_object = ResumeScore).get_format_instructions()
    
    instruction_prompt = """
    You are an expert resume reviewer and hiring manager with over 10 years of experience screening candidates for technical and non-technical roles.

    Your task is to evaluate the quality of a candidate’s resume in relation to a specific job role (provided below). You must provide:
    
    ---
    
    1. **Overall Resume Score (0–100)**  
       - Base this on clarity, relevance to the role, formatting, structure, language, and completeness.
    
    2. **Improvement Suggestions**  
       - Give **clear, constructive, and non-repetitive tips** to improve the resume.
       - Give a **maximum of 10** tips. If the resume is already strong, return **fewer or none**.
       - Do **not invent flaws** — if something is already good, **don’t suggest unnecessary changes**.
       - Focus on things like formatting clarity, missing metrics, vague descriptions, inconsistent verb tenses, or irrelevant content.
       - Summarize all the suggestions in well under 7 points.
       - All suggestions should be very crisp and concise. It should be pointwise and one line each.
       
    ---
    
    ### Evaluation Criteria:
    - Relevance to the target job
    - Clear, concise, and action-oriented language
    - Use of measurable achievements
    - Logical structure and consistent formatting
    - Grammar, tone, and professionalism
    
    ---
    
    ### Input:
    **Target Job Title**: {jobRole}
    **Candidate Resume**:
    {resume}
    
    {format_instructions}
    """

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
    
    instruction_format = """
    You are a resume analysis assistant.
    
    Your task is to analyze the following resume text and determine whether it contains:
    
    1. A valid **email address**
    2. A valid **phone number** (contact number or mobile number)
    
    Then return:
    
    - The **email ID**, if found
    - The **phone number**, if found
    - A **color**: `"green"` if both are present, otherwise `"red"`
    - A **comment** explaining what's present or missing
    
    ---
    
    ### Input Resume:
    {resume_text}
    
    ---
    
    ### Output Rules:
    - If **both email and phone number are present**, return:
      - color: `"green"`
      - comment: `"Both contact number and email ID are present."`
    
    - If **either or both are missing**, return:
      - color: `"red"`
      - comment: clearly specify what’s missing, e.g. `"Email ID is missing."`, `"Phone number is missing."`, or `"Both are missing."`
    
    - If either email or phone number is not found, return `null` for that field.
    
    ---
    
    ### Output Format (JSON):
    {output_information}
    
    """

    prompt_template = PromptTemplate.from_template(template = instruction_format, 
                                                   partial_variables={"output_information": output_parser})

    chain = prompt_template | llm | JsonOutputParser()

    return chain


def get_summary_overview():

    class summary_score_extractor(BaseModel):

        score: int = Field("Score of the resume based on Summary Section Analysis, an Applicant Tracking System would give.")
        color: str = Field("`'green'` if score is above 80, `'orange'` if the score is between 40 and 80 and `'red'` if the score is less than 40")
        label: str = Field("`'good'` if score is above 80, `warning` if the score is between 40 and 80 and `critical` if the score is less than 40")
        comment: str = Field("A brief justification of the score awarded")

    output_parser = PydanticOutputParser(pydantic_object = summary_score_extractor).get_format_instructions()
    
    instruction_format = """
    You are an expert resume evaluator.

    Your task is to analyze the **Summary section** of a resume and score it based on how well it aligns with a specific job role.
    - Clarity and conciseness
    - Relevance to job roles
    - Use of strong, action-oriented language
    - Mention of key skills and experience
    - Overall professionalism and tone
    
    ---

    **Job Role**: {job_role}  
    **Resume Summary**:
    {resume}
    
    ---
    
    ### Evaluation Logic:
    
    1. If the summary is **missing, empty, or irrelevant**, return:
       - score: any value below 40 (e.g. 20)
       - label: `"critical"`
       - color: `"red"`
       - comment: `"No summary section was provided in the resume."` or equivalent
    
    2. Otherwise:
       - Evaluate the summary and assign a **score from 0–100**
       - Based on the score, assign:
         - score < 40 → `"critical"` + `"red"`
         - 40 ≤ score ≤ 80 → `"warning"` + `"orange"`
         - score > 80 → `"good"` + `"green"`
       - Add a comment explaining the rating in 1–3 lines
    
    ---
    
    ### Output Format (JSON):
    {output_information}
    
    """

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
    
    instructions_format = """
    You are a professional resume reviewer.
    
    Your task is to evaluate a resume's suitability for a specific job role by scoring it across four aspects:
    
    ---
    
    ### Aspects to Evaluate:
    
    1. **Searchability**  
       - How well the resume is optimized for ATS systems and keyword-rich
    
    2. **Hard Skills**  
       - Relevance and presence of technical/domain-specific skills
    
    3. **Soft Skills**  
       - Presence of communication, leadership, teamwork, adaptability, etc.
    
    4. **Formatting**  
       - Visual clarity, structure, readability, and professional layout
    
    ---
    
    **Job Role**: {job_role}  
    **Resume Text**:  
    {resume_text}
    
    ---
    
    ### Scoring Instructions:
    
    - Assign a score between **0 and 100** for each aspect
    - Do **not** include comments, explanations, labels, or overall score
    - Return output strictly in the following JSON format
    
    ---
    
    ### Output Format (JSON):
    {output_format}
    """

    prompt_instruction = PromptTemplate.from_template(template=instructions_format, 
                                                      partial_variables={"output_format": output_parser})

    chain = prompt_instruction | llm | JsonOutputParser()

    return chain

