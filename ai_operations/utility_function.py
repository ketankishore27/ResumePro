from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field, RootModel, conint
from langchain_core.output_parsers import PydanticOutputParser, JsonOutputParser
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI, AzureChatOpenAI
from enum import Enum
from typing import Dict, List, Union, Literal, Optional

load_dotenv(override=True)
#llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.)
#llm = ChatOpenAI(model="gpt-4o", temperature=0.)
llm = AzureChatOpenAI(model="gpt-4o-mini", api_version="2025-04-01-preview")

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

    class ResumeSummaryScore(BaseModel):
        summary: List[str] = Field(..., description="List of bullet points extracted from the summary section")
        score: conint(ge=0, le=100) = Field(..., description="Integer score between 0 and 100")
        label: Literal["critical", "warning", "good"] = Field(..., description="Label based on score range")
        color: Literal["red", "orange", "green"] = Field(..., description="Color indicating severity level")
        comment: str = Field(..., description="Short justification for the score")

    output_parser = PydanticOutputParser(pydantic_object = ResumeSummaryScore).get_format_instructions()
    
    instruction_format = """
    You are an expert resume evaluator.
    
    Your task is to:
    1. Extract the **Summary section** from the full resume.
    2. If the summary is a paragraph, split it into clear bullet points.
    3. Score how well the summary aligns with the given job role.
    4. Return your output in structured JSON format.
    
    ---
    
    ### 🎯 Inputs:
    **Job Role**: {job_role}  
    **Full Resume Text**:  
    {resume_text}
    
    ---
    
    ### 🔍 Step 1: Identify and Extract the Summary Section
    
    Search for a section labeled (or resembling):
    - "Summary"
    - "Profile Summary"
    - "Professional Summary"
    - "Career Overview"
    - "About Me"
    - "Executive Summary"
    
    Extract only the most relevant part.
    
    If no such section is found, return `summary: []`, score `0`, and provide a comment indicating the absence of a summary.
    
    ---
    
    ### 🧩 Step 2: Format the Extracted Summary
    
    If the extracted summary is **a paragraph** or block of text:
    - Split it into **clear bullet points** or concise **statements** (one idea per string).
    - Each point should be professional, relevant, and self-contained.
    
    If already pointwise, preserve the original list.
    
    ---
    
    ### 📊 Step 3: Evaluate the Summary
    
    Criteria:
    - Relevance to the job role
    - Mention of tools, skills, industries, or accomplishments
    - Professional tone and clarity
    - Concise and purposeful language
    
    ---
    
    ### 📈 Scoring Logic:
    
    1. **Missing Summary**:
       - `"summary"`: `[]`
       - `"score"`: `0`
       - `"label"`: `"critical"`
       - `"color"`: `"red"`
       - `"comment"`: `"No relevant summary section found."`
    
    2. **Irrelevant Summary**:
       - `"score"`: `1–10`
       - `"label"`: `"critical"`
       - `"color"`: `"red"`
       - `"comment"`: `"The summary does not relate to the job role."`
    
    3. **Generic Summary**:
       - `"score"`: `11–30`
       - `"label"`: `"critical"`
       - `"color"`: `"red"`
       - `"comment"`: `"The summary is too generic and lacks job-specific relevance."`
    
    4. **Partially Relevant Summary**:
       - `"score"`: `31–80`
       - `"label"`: `"warning"`
       - `"color"`: `"orange"`
    
    5. **Highly Relevant Summary**:
       - `"score"`: `81–100`
       - `"label"`: `"good"`
       - `"color"`: `"green"`
    
    Always add a short `"comment"` (1–3 lines) explaining the score.
    ---
    
    ### ✅ Output Format (JSON):
    
    Return the following JSON:
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


def get_other_comments():

    class other_feedbacks(BaseModel):
        
        headings_feedback: str = Field("Feedback text for the Section Headings")
        title_match: str = Field("Feedback text for the Job Title Match")
        formatting_feedback: str = Field("Feedback text for the Data Formatting")
        

    output_parser = PydanticOutputParser(pydantic_object=other_feedbacks).get_format_instructions()
        
    instruction_format = """
    You are a professional resume reviewer.
    
    Your task is to analyze the resume and provide concise, aspect-wise feedback across the following three dimensions:
    
    ---
    
    ### Aspects to Evaluate:
    
    1. **Section Headings**  
       - Are all key sections present (e.g., Summary, Experience, Education, Skills)?
       - Are headings clearly labeled and easy to identify?
    
    2. **Job Title Match**  
       - Does the resume include job titles that closely match or are relevant to the target job role?
       - Are these titles prominently placed and easy to interpret?
    
    3. **Data Formatting**  
       - Is the content consistently formatted?
       - Are bullet points, spacing, dates, and alignment professional and easy to scan?
    
    ---
    
    ### Inputs:
    **Job Role**: {job_role}  
    **Resume Text**:  
    {resume_text}
    
    ---
    
    ### Output Instructions:
    
    - For each aspect, provide a **short, crisp feedback (1–2 lines)**
    - Focus the feedback on **relevance to the job role**, clarity, and professionalism
    - Do **not** include scores or overall evaluation
    
    ---
    
    ### Output Format (JSON):
    {output_format}
    """

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
    
    instruction_format = """
    You are a resume analysis expert.

    Your task is to analyze the following resume and extract structured information about:
    
    1. Whether the candidate has any real-world industry exposure (including internships)
    2. Whether the candidate has completed their college education
    3. The candidate's functional exposure — i.e., which industries they have worked in and in what proportion
    
    ---
    
    ### Step-by-Step Instructions:
    
    1. **Determine education status:**
       - Look for degree end dates (e.g., “2021–2025”) or phrases like “Pursuing”, “Ongoing”, “Expected”.
       - If the candidate has completed their degree, set `has_completed_college` to `true`.
       - If they are still pursuing or haven’t yet completed college, set `has_completed_college` to `false`.
    
    2. **Determine industry experience:**
       - Look for full-time jobs or internships in real-world companies or industry projects.
       - If the candidate has any such experience (internship or full-time), set `has_industry_experience` to `true`.
       - Otherwise, set it to `false`.
    
    3. **Identify functional exposure (industries):**
       - Extract company names, roles, and projects to infer the industry for each.
       - Estimate **relative exposure** in percentages — based on time spent, emphasis in the resume, and role recency.
       - Ensure the values in `constituent` add up to exactly **100%**, formatted as strings with a `%` sign (e.g., `"40%"`).
    
    ---
    
    ### ⚠️ Strict Industry Naming Rules:
    
    You must use **only one** of the following predefined industry names for each entry in `constituent` and `industries`:

    ---    
    ### Input Resume:
    {resume_text}
    
    ---
    
    ### Output Format:
    {output_format}
    
    """

    prompt_template = PromptTemplate(template=instruction_format,
                                     partial_variables = {"output_format": output_parser})

    chain = prompt_template | llm | JsonOutputParser()

    return chain


def technical_constituent():

    class TechnicalExposureGrouped(BaseModel):
        high: List[str]
        medium: List[str]
        low: List[str]
        
    
    output_parser = PydanticOutputParser(pydantic_object=TechnicalExposureGrouped).get_format_instructions()
    
    instruction_format = """
    You are an expert in resume analysis and technical skill evaluation.
    
    Your task is to extract only the **technologies, tools, and programming languages** that the candidate has **actually worked with**, based on their resume.
    
    Then, categorize them into three levels of relevance and usage confidence based on the candidate’s **past experience** and the specified **job role**.
    
    ---
    
    ### 📌 Guidelines:
    
    1. **Read the resume thoroughly.**
    2. **Extract only the technologies** that show evidence of hands-on use — in projects, job roles, internships, or education.
    3. **Standardize each technology/tool name** to its commonly recognized form.
       - `python3` → `"Python"`
       - `Amazon Web Services` → `"AWS"`
       - `react js` → `"React"`
       - `postgres` → `"PostgreSQL"`
    
    ---
    
    ### 🎯 Classification Criteria:
    
    - `"high"`: Strong usage demonstrated in multiple roles or major projects, **highly relevant** to the given job role.
    - `"medium"`: Moderate usage or mention in one role/project, **somewhat relevant** to the job role.
    - `"low"`: Brief or indirect mention, or **not highly relevant** to the job role — but with some evidence of exposure.
    
    ⚠️ Do not include any technology that does not appear in the resume.
    
    ---
    
    ### 📄 Resume:
    {resume_text}
    
    ---
    
    ### 💼 Job Role:
    {job_role}
    
    ---
    
    ### ✅ Output Format:
    
    Return a JSON object with exactly three keys: `"high"`, `"medium"`, and `"low"`.
    
    Each key must return a **list of standardized technology names**.  
    If there are no technologies in a category, return an **empty list** (`[]`) — not null, not missing.
    
    ---
    ### Output Format:
    Return a JSON object with 3 keys: `"high"`, `"medium"`, and `"low"`. Each contains a **list of standardized technologies** that the candidate has worked with, even if briefly.
    {output_format}
    
    """

    prompt_template = PromptTemplate(template=instruction_format, 
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
    
    instruction_format = """
        You are an expert in resume parsing and candidate profiling.
    
    Your task is to analyze the resume text below and extract all **formal education qualifications**, including their **timelines**, and return them in **descending order of end year** (i.e., most recent education first).
    
    ---
    
    ### ✅ Instructions:
    
    1. Read the full resume carefully.
    2. Extract all entries related to **formal education only** (e.g., degrees, diplomas, academic programs).
       - Exclude certifications, bootcamps, training courses, and online learning unless clearly stated as a formal degree program.
    3. For each valid entry, extract the following fields:
       - `degree`: The full degree or qualification name (e.g., "B.Tech in Computer Science").
       - `institution`: Name of the institution (e.g., "IIT Delhi", "Stanford University").
       - `start_year`: The year the program started (in `YYYY` format).
       - `end_year`: The year the program ended or is expected to end (in `YYYY` format), or `"ongoing"` if still in progress.
    
    4. Sort all extracted education entries in **descending order by `end_year`**. Place `"ongoing"` entries at the top.
    
    ---
    
    ### 📄 Resume Text:
    {resume_text}
    
    ---
    
    ### ✅ Output Format (JSON):
    
    Return an array of JSON objects sorted as described. Example:
    {output_format}
    """

    prompt_template = PromptTemplate(template=instruction_format, 
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

    instruction_format = """
    You are an expert resume evaluator.

    Your task is to analyze the **Projects** section of a resume and evaluate how well each project aligns with a specific job role.

    ---

    ### 🎯 Inputs:
    - **Job Role**: {job_role}
    - **Full Resume Text**: {resume_text}

    ---

    ### 🧠 Instructions:

    1. **Extract Projects (in order)**:
    - Identify all distinct projects in the resume, preserving the **original order of appearance**.
    - For each project, extract:
        - `title`: The name or headline of the project
        - `description`: A brief one-line summary (if available)
        - `technologies`: List of programming languages, frameworks, tools, or methods used (if mentioned)

    2. **Evaluate Relevance**:
    - Assign a **score between 0 and 100** based on how well the project aligns with the job role.
    - Scoring should consider:
        - Overlap of tools, methods, or challenges with the target role
        - Domain or business relevance
        - Outcomes or responsibilities demonstrated

    3. **Color Coding**:
    - Based on score, assign a color:
        - Score < 40 → `"light red"`
        - 40 ≤ score < 80 → `"light orange"`
        - Score ≥ 80 → `"light green"`

    4. **Comment**:
    - Add a brief (1–2 line) comment explaining the reasoning behind the score.

    5. **Stage Classification (Mandatory Logic)**:

        You must assign one of the following values to the `"stage"` key:
        - `"Intern"`
        - `"POC"`
        - `"Production"`

        Apply this logic in the following strict order:

        1. **Intern Override Rule (Highest Priority)**:  
            - If the project was done **while the candidate was an intern, trainee, apprentice, or student**,  
                then set `"stage"` to `"Intern"` —  
                even if the project was deployed in production or described as a real-world implementation.

        2. If NOT an intern project, then:
            - Set `"stage"` to `"POC"` if the project is a prototype, hackathon, research, or academic demo.
            - Set `"stage"` to `"Production"` if the project was used by real users, deployed, integrated into systems, or had measurable impact.

        🛑 Do not ignore the **intern override rule** under any circumstance.

    - Use the most reasonable inference from resume context.

    ---
    
    ### ✅ Output Format (JSON):
    {output_format}
    """

    prompt = PromptTemplate(template=instruction_format, 
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
        
    instruction_format = """
    You are an expert resume parser.
    
    Your task is to analyze the resume and extract the candidate's **employment history**, with emphasis on position, company, duration, and type of employment.
    
    ---

    ### Resume Text:
    {resume_text}
    
    ---
    
    ### Your Output Should Include:
    
    For each job listed in the resume, extract the following fields:
    
    1. **company**: Name of the company or organization  
    2. **position**: Role or job title held by the candidate  
    3. **start_year**: Year the candidate started this job (as a 4-digit integer, e.g., 2018)  
    4. **end_year**: Year the candidate ended the job.  
       - If the candidate is still working in this company, set this to `"Currently Working"`  
    5. **employment_type**: One of the following categories, based on context clues:
       - `"Permanent"`
       - `"Intern"`
       - `"Part Time"`
       - `"Contractual"`
       - `"Non Permanent"` (includes freelance, temporary, consultant, volunteer, etc.)
    
    ---
    
    ### Logic Guidelines:
    
    - If the candidate **is still employed**, based on phrases like `Present`, `Currently`, `Current`, or missing end date → set `"end_year"` as `"Currently Working"`
    - Use keywords or role context to determine **employment_type**:
      - If job title includes `Intern`, `Trainee`, or similar → `"Intern"`
      - If the role is `Part-time`, `Evening job`, or `Side gig` → `"Part Time"`
      - If it includes `Contract`, `Contractual`, `Freelancer`, or `Outsourced` → `"Contractual"`
      - If temporary, freelance, project-based, or volunteer → `"Non Permanent"`
      - Else → `"Permanent"`
    - Try to infer job type even if labels are implicit (e.g., "6-month assignment" could mean `"Contractual"`)
    - Only include positions where both **company** and **position** can be reasonably identified
    - List jobs in **reverse chronological order** (most recent first)

    ---

    ### Final Instruction:

    - Do not invent or hallucinate companies, roles, or dates.
    - Ensure the final output is in valid JSON format and includes all specified keys for each job.
    
    ---
    
    ### Output Format (JSON):
    {output_format}
    
    """

    prompt = PromptTemplate.from_template(template=instruction_format, 
                                          partial_variables = {"output_format": output_parser})

    chain = prompt | llm | JsonOutputParser()

    return chain


def extract_names():

    class ResumeName(BaseModel):
        name: str = Field("Name of the person mentioned in resume")

    output_parser = PydanticOutputParser(pydantic_object=ResumeName)
    
    instruction_format = """
    You are given the text content of a resume and, if available, the candidate’s email address.  
    Your task is to identify the name of the candidate.  
    
    Instructions:  
    - Search for the name in typical places such as the resume header, first few lines, or before contact details.  
    - If the resume does not explicitly state the name, infer it from the email address if possible (e.g., john.doe@email.com → John Doe).  
    - The name must be in proper case (e.g., "John Doe").  
    - If no reasonable name can be found or inferred, set the value to "Name Not Found".  
    
    ### Resume Text:
    {resume_text}
    
    ### Email:
    {email_id}

    ### Output Format (JSON):
    {output_format}
    
    """

    prompt = PromptTemplate(template=instruction_format, 
                            partial_variables={"output_format": output_parser})

    chain = prompt | llm | JsonOutputParser()

    return chain

