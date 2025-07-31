from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser, JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv(override=True)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.)

def create_resume_score():

    class ResumeScore(BaseModel):
            score: int = Field("Overall score of the resume, an Applicant Tracking System would give to the resume.")

    output_format = PydanticOutputParser(pydantic_object = ResumeScore).get_format_instructions()
    instruction_prompt = """
    You are a hiring manager and resume reviewer with 10+ years of experience in talent acquisition and human resource management.
    
    Your task is to critically evaluate a candidate's resume and provide the following outputs:
    
    1. **Score (out of 100)** — based on overall quality, clarity, relevance, structure.
    
    ---
    
    ### Evaluation Criteria:
    - Clarity and conciseness of content
    - Structure and formatting
    - Use of metrics and accomplishments
    - Language quality (grammar, tone, consistency)
    
    ---
    
    **Candidate Resume**:
    {resume}
    
    {format_instructions}
    """

    scoring_prompt = PromptTemplate.from_template(template=instruction_prompt, 
                                              partial_variables = {"format_instructions": output_format})

    chain = scoring_prompt | llm | JsonOutputParser()
    
    return chain

scoring_chain = create_resume_score()