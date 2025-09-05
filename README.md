# ResumePro — Career Development Tool

An AI-powered resume insights and career tooling suite with a FastAPI backend and a Next.js frontend.

- Backend: FastAPI ([action_server.py](./action_server.py)), LangChain-based AI chains, PostgreSQL via SQLAlchemy
- Frontend: Next.js + Material UI, Chart.js
- Database: PostgreSQL (JSON-heavy schema for analysis outputs)

![Dashboard Page 1](git%20images/landing_page-1.png)
![Dashboard Page 2](git%20images/landing_page-2.png)
![Dashboard Page 3](git%20images/landing_page-3.png)
![Dashboard Page 4](git%20images/landing_page-4.png)
![Dashboard Page 5](git%20images/landing_page-5.png)
![Dashboard Page 6](git%20images/landing_page-6.png)
![Dashboard Page 7](git%20images/landing_page-7.png)
![Dashboard Page 8](git%20images/landing_page-8.png)


---

## Table of Contents
- Overview
- Features
- Architecture
- Frontend Operations
- Backend Operations (API)
- API Quick Reference
- Database
- Setup and Run
- Usage Walkthrough
- Environment Variables
- Troubleshooting

---

## Overview

ResumePro analyzes resumes, generates insights, and supports workflows like:
- Querying candidate data from DB or new uploads
- AI-based scoring and section analysis
- Cover letter generation
- Bulk import processing with progress tracking

---

## Features

- Resume insights: overall score, custom scores, summary analysis (with dynamic color-coded chips and progress bars)
- Contact extraction, education history, projects, employment timeline
- Functional and technical exposure breakdown
- Projects and Technical Exposure share a three-tier color coding (High/Medium/Low relevance)
- Professional Timeline: step-like vertical employment timeline (reverse chronological)
- Education History: horizontal milestone timeline with gradient connectors
- Unified database retrieval via `/extractData` for insights page
- Bulk import processing with real-time visual progress (Linear + Circular)
- AI cover letter generation page integrated with Resume Requests
- Centralized landing inputs for Name, Job Role, Location, and a single file upload
- Navigation label updated to "Query Candidate" (URL remains `/insights`)
 - Relevant Candidates page includes Experience filter ranges (<=2y, 2–5y, 5–7y, 7–10y, >10y)

![Query Candidate](git%20images/Query%20Candidate_new.png)
![Bulk Import Facility](git%20images/Bulk_import.png)

---

## Architecture

- Frontend (Next.js) in `frontend/`
  - Talks to FastAPI at `http://127.0.0.1:8000`
- Backend (FastAPI) in project root [action_server.py](./action_server.py)
  - Exposes endpoints for analysis, DB assembly, and queries
- Database (PostgreSQL)
  - JSON columns to store structured analysis results

---

## Frontend Operations

Location: `frontend/`

- Key pages (see `frontend/pages/`):
  - `_app.js`: global wrappers/theme
  - `bulk-import.js`: bulk resume processing with progress bars
  - `cover-letter.js`: AI cover letter generator
  - Additional dashboard/query pages for insights

- Core flows:
  - Central input section for Name, Job Role, Location + single resume file upload
  - Query Candidate/Insights: analyzes and renders all dynamic sections
  - Resume Requests → Cover Letter: generates tailored cover letters
  - Bulk Import: processes multiple resumes with determinate and spinner progress

- Scripts ([frontend/package.json](./frontend/package.json)):
  - `npm run dev` — start dev server (Next.js)
  - `npm run build` — build
  - `npm run start` — run production build

- Image policy: see [frontend/next.config.js](./frontend/next.config.js) for remote image patterns (Unsplash)

---

## Backend Operations (API)

Server entry: [action_server.py](./action_server.py)  
Base URL: `http://127.0.0.1:8000`  
CORS: open to all origins

- POST `/test`  
  Health check. Res: `{ status, message }`

- POST `/getNames`  
  Req: `{ resumeText, email_id? }`  
  Res: `{ name }`

- POST `/scoreResume`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ score, jobRole, items }`

- POST `/getContacts`  
  Req: `{ resumeText }`  
  Res: `{ color, comment, email_id, mobile_number }`

- POST `/getSummaryOverview`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ color, score, label, comment, summary[] }`

- POST `/getCustomScores`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ searchibility_score, hard_skills_score, soft_skill_score, formatting_score }`

- POST `/getOtherComments`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ headings_feedback, title_match, formatting_feedback }`

- POST `/getFunctionalConstituent`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ constituent, industries, has_industry_experience, has_completed_college }`

- POST `/getTechnicalConstituent`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ high[], medium[], low[] }`

- POST `/getEducation`  
  Req: `{ resumeText }`  
  Res: `[ { degree, institution, start_year, end_year } ]`

- POST `/getProjects`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ projects: [ { title, description, technologies[], score, color, comment, stage } ] }`

- POST `/getCompany`  
  Req: `{ resumeText }`  
  Res: `{ employment_history: [ { company, position, start_year, end_year, employment_type } ] }`

- POST `/getYoe`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ yoe, ryoe }`

- POST `/getRecruitersOverview`  
  Req: `{ resumeText, jobRole }`  
  Res: `{ bullets[], relevant_experience, technical_proficiency[] }`

- POST `/getDesignation`  
  Req: `{ resumeText }`  
  Res: `{ current_designation, previous_designation }`

- POST `/getLocation`  
  Req: `{ resumeText }`  
  Res: `{ location, confidence_score }`

- POST `/assembleData`  
  Req: assembled payload with inputs and the above endpoint outputs  
  Res: `{ response }` (persists to DB)

- POST `/processBulkImport`  
  Orchestrates analysis calls and persistence for a resume item  
  Res: `{ email_id, contact_number, name, summary_overview, score_resume, parsed_status }`

- POST `/extractData`  
  Unified database read used by the frontend Insights (Query Candidate) page  
  Req: `{ email_id }`  
  Res: full candidate record from DB or a 404-style payload

- POST `/generateCoverLetter`  
  Req: `{ resumeText, description }`  
  Res: `{ coverLetter }`

- POST `/filterCandidate`  
  Req: `{ wordList, jobRole, jobDescription }`  
  Res: filtered candidates payload

---

## API Quick Reference

Base URL: `http://127.0.0.1:8000`

- Health Check — `POST /test`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/test
  ```

  Response:

  ```json
  { "status": "success", "message": "Server is working!" }
  ```

- Extract Candidate — `POST /extractData`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/extractData \
    -H 'Content-Type: application/json' \
    -d '{"email_id":"john.doe@example.com"}'
  ```

  Response (example):

  ```json
  {
    "name": "John Doe",
    "email_id": "john.doe@example.com",
    "mobile_number": "+1-555-123-4567",
    "score_resume": { "score": 82, "items": ["..."] },
    "get_contacts": { "email_id": "john.doe@example.com", "mobile_number": "+1-555-123-4567" },
    "get_summary_overview": { "color": "green", "label": "good", "comment": "..." },
    "get_custom_scores": { "searchibility_score": 78, "hard_skills_score": 80, "soft_skill_score": 76, "formatting_score": 84 },
    "get_functional_constituent": { "constituent": { "IT": "60%", "Banking": "40%" } },
    "get_technical_constituent": { "high": ["Java", "React"], "medium": ["Docker"], "low": ["Kotlin"] },
    "get_education": [ { "degree": "M.Tech", "institution": "BITS", "start_year": 2016, "end_year": 2018 } ],
    "get_projects": { "projects": [ { "title": "Project A", "score": 85 } ] },
    "get_company": { "employment_history": [ { "company": "ACME", "position": "SE", "start_year": 2020, "end_year": 2023, "employment_type": "Permanent" } ] }
  }
  ```

  Error example:

  ```json
  { "response": "Candidate not found", "error": "Relevant Candidate Not Found", "status": 404 }
  ```

- Generate Cover Letter — `POST /generateCoverLetter`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/generateCoverLetter \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<resume text>","description":"Full-stack role at ACME"}'
  ```

  Response:

  ```json
  { "coverLetter": "Dear Hiring Manager, ..." }
  ```

- Score Resume — `POST /scoreResume`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/scoreResume \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<resume text>","jobRole":"Software Engineer"}'
  ```

  Response:

  ```json
  { "score": 82, "jobRole": "Software Engineer", "items": ["..."] }
  ```

- Process Bulk Import — `POST /processBulkImport`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/processBulkImport \
    -H 'Content-Type: application/json' \
    -d '{"email_id":"john.doe@example.com","resumeText":"<text>","jobRole":"Data Analyst"}'
  ```

  Response (example):

  ```json
  {
    "email_id": "john.doe@example.com",
    "contact_number": "+1-555-123-4567",
    "name": "John Doe",
    "summary_overview": "...",
    "parsed_status": "Successful"
  }
  ```

- Filter Candidate — `POST /filterCandidate`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/filterCandidate \
    -H 'Content-Type: application/json' \
    -d '{"wordList":["python","sql"],"jobRole":"Data Engineer","jobDescription":"ETL pipelines"}'
  ```

  Response (example shape varies with data):

  ```json
  { "candidates": [ { "email_id": "john.doe@example.com", "name": "John Doe", "score": 85 } ] }
  ```

---

- Get Names — `POST /getNames`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getNames \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","email_id":"john.doe@example.com"}'
  ```

  Response:

  ```json
  { "name": "John Doe" }
  ```

- Get Contacts — `POST /getContacts`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getContacts \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>"}'
  ```

  Response:

  ```json
  { "color": "green", "comment": "Valid", "email_id": "john.doe@example.com", "mobile_number": "+1-555-123-4567" }
  ```

- Summary Overview — `POST /getSummaryOverview`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getSummaryOverview \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","jobRole":"Software Engineer"}'
  ```

  Response:

  ```json
  { "color": "green", "score": 80, "label": "good", "comment": "...", "summary": ["point 1", "point 2"] }
  ```

- Custom Scores — `POST /getCustomScores`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getCustomScores \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","jobRole":"Software Engineer"}'
  ```

  Response:

  ```json
  { "searchibility_score": 78, "hard_skills_score": 80, "soft_skill_score": 76, "formatting_score": 84 }
  ```

- Other Comments — `POST /getOtherComments`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getOtherComments \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","jobRole":"Software Engineer"}'
  ```

  Response (example):

  ```json
  {
    "headings_feedback": { "score": 85, "comment": "Well-structured" },
    "title_match": { "score": 72, "comment": "Job titles mostly align" },
    "formatting_feedback": { "score": 90, "comment": "Clean formatting" }
  }
  ```

- Functional Exposure — `POST /getFunctionalConstituent`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getFunctionalConstituent \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","jobRole":"Software Engineer"}'
  ```

  Response:

  ```json
  {
    "constituent": { "IT": "60%", "Banking": "40%" },
    "industries": ["IT", "Banking"],
    "has_industry_experience": true,
    "has_completed_college": true
  }
  ```

- Technical Exposure — `POST /getTechnicalConstituent`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getTechnicalConstituent \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","jobRole":"Software Engineer"}'
  ```

  Response:

  ```json
  { "high": ["Java", "React"], "medium": ["Docker"], "low": ["Kotlin"] }
  ```

- Education — `POST /getEducation`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getEducation \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>"}'
  ```

  Response:

  ```json
  [ { "degree": "M.Tech", "institution": "BITS", "start_year": 2016, "end_year": 2018 } ]
  ```

- Projects — `POST /getProjects`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getProjects \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","jobRole":"Software Engineer"}'
  ```

  Response:

  ```json
  {
    "projects": [
      {
        "title": "Project A",
        "description": "...",
        "technologies": ["Python", "SQL"],
        "score": 85,
        "color": "green",
        "comment": "Relevant",
        "stage": "production"
      }
    ]
  }
  ```

- Employment History — `POST /getCompany`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getCompany \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>"}'
  ```

  Response:

  ```json
  { "employment_history": [ { "company": "ACME", "position": "SE", "start_year": 2020, "end_year": 2023, "employment_type": "Permanent" } ] }
  ```

- Years of Experience — `POST /getYoe`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getYoe \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","jobRole":"Software Engineer"}'
  ```

  Response:

  ```json
  { "yoe": 6.5, "ryoe": 6 }
  ```

- Recruiters Overview — `POST /getRecruitersOverview`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getRecruitersOverview \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>","jobRole":"Software Engineer"}'
  ```

  Response:

  ```json
  {
    "bullets": ["Accomplishment A", "Accomplishment B"],
    "relevant_experience": "5+ years in backend",
    "technical_proficiency": ["Python", "FastAPI"]
  }
  ```

- Designation — `POST /getDesignation`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getDesignation \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>"}'
  ```

  Response:

  ```json
  { "current_designation": "Senior Software Engineer", "previous_designation": "Software Engineer" }
  ```

- Location — `POST /getLocation`

  Request:

  ```bash
  curl -s -X POST http://127.0.0.1:8000/getLocation \
    -H 'Content-Type: application/json' \
    -d '{"resumeText":"<text>"}'
  ```

  Response:

  ```json
  { "location": "Bengaluru, IN", "confidence_score": 0.92 }
  ```

- Assemble Data — `POST /assembleData`

  Request (example shape — persists to DB):

  ```bash
  curl -s -X POST http://127.0.0.1:8000/assembleData \
    -H 'Content-Type: application/json' \
    -d '{
      "name": "John Doe",
      "email_id": "john.doe@example.com",
      "mobile_number": "+1-555-123-4567",
      "score_resume": { "score": 82, "items": [] },
      "get_contacts": { "email_id": "john.doe@example.com", "mobile_number": "+1-555-123-4567" },
      "get_summary_overview": { "color": "green", "label": "good", "comment": "..." },
      "get_custom_scores": { "searchibility_score": 78, "hard_skills_score": 80, "soft_skill_score": 76, "formatting_score": 84 },
      "get_functional_constituent": { "constituent": { "IT": "60%" } },
      "get_technical_constituent": { "high": ["Java"], "medium": ["Docker"], "low": [] },
      "get_education": [ { "degree": "M.Tech", "institution": "BITS", "start_year": 2016, "end_year": 2018 } ],
      "get_projects": { "projects": [ { "title": "Project A", "score": 85 } ] },
      "get_company": { "employment_history": [ { "company": "ACME", "position": "SE", "start_year": 2020, "end_year": 2023, "employment_type": "Permanent" } ] }
    }'
  ```

  Response (example):

  ```json
  { "response": "Success" }
  ```

---

## Database

Location: [db_operations/utility_db.py](./db_operations/utility_db.py)

- Connection (adjust as needed):
  `postgresql+psycopg2://postgres:resume_db@localhost:5432/postgres`
- Table name comes from env var `TABLE_NAME` (required)
- Writes JSON columns for endpoint outputs; upserts by `email_id`
- `extract_data(email_id)` reads from `TABLE_NAME` and returns a record (minus raw text, mode, candidate_id)

---

## Setup and Run

Prerequisites:
- Python 3.12+
- Node.js 18+ and npm
- PostgreSQL running locally

Python dependencies are managed in [pyproject.toml](./pyproject.toml):
- FastAPI, Uvicorn, LangChain libs, Pandas, Psycopg2, Pydantic, python-dotenv, etc.

1) Backend
- Install deps (choose one approach):
  - Using uv/pip:
    - `pip install uv` (if not installed)
    - `uv pip install -e .` (or `pip install -e .` with PEP 621 aware tooling)
  - Or install packages explicitly per [pyproject.toml](./pyproject.toml)
- Set env:
  - `export TABLE_NAME=<your_table_name>`
  - Ensure the Postgres connection string in [db_operations/utility_db.py](./db_operations/utility_db.py) matches your credentials
  - Optional: use a `.env` file (dotenv is loaded)
- Run FastAPI:
  - `uvicorn action_server:app --host 0.0.0.0 --port 8000`
  - Before starting, verify port 8000 is free or that a backend instance isn't already running
  - Health check: `curl -X POST http://127.0.0.1:8000/test`

2) Frontend
- `cd frontend`
- `npm install`
- `npm run dev`
- Open: `http://localhost:3000` (frontend talks to backend on `http://127.0.0.1:8000`)
  - Before starting, verify port 3000 is free or that a dev server isn't already running

---

## Usage Walkthrough

- Landing section
  - Enter Name, Job Role, Location
  - Upload resume (single centralized upload)
- Query Candidate / Insights
  - Analyzes resume, renders scores, summary, contact info, functional/technical exposure, projects, employment timeline (step timeline), education (horizontal timeline)
  - Frontend now uses a single `/extractData` call to fetch complete candidate data for known `email_id`
- Resume Requests
  - Generates a cover letter via `/generateCoverLetter` based on resume text and description
- Bulk Import
  - Processes multiple resumes with visual progress (Linear + Circular indicators)
  - Shows current file, percentage, and completion

---

## Environment Variables

- `TABLE_NAME`: required; DB table used by `/assembleData` and `/extractData`
- Optional provider keys for LangChain integrations if you enable external LLMs; never hardcode secrets

---

## Troubleshooting

- Backend unreachable:
  - Ensure `uvicorn` is running on port 8000, check logs
  - If port 8000 is in use, stop the existing process or choose a different port
  - Port already in use (macOS):
    ```bash
    # Find which process is using the port
    lsof -i :8000

    # Gracefully stop the process (replace <PID> with the number from the previous command)
    kill -TERM <PID>

    # If it doesn't stop, force kill (use sparingly)
    kill -9 <PID>

    # Run backend on an alternate port
    uvicorn action_server:app --host 0.0.0.0 --port 8001

    # Quick health check
    curl -s -X POST http://127.0.0.1:8001/test
    ```
- DB errors:
  - Verify Postgres is running, `TABLE_NAME` is set, and credentials in [utility_db.py](./db_operations/utility_db.py)
- CORS:
  - Already enabled for all origins in [action_server.py](./action_server.py)
- Frontend build issues:
  - Use Node 18+, `npm install` cleanly, and check [frontend/next.config.js](./frontend/next.config.js) if loading external images
  - Frontend port 3000 already in use (macOS):
    ```bash
    # Find and stop process on port 3000
    lsof -i :3000
    kill -TERM <PID>
    kill -9 <PID>  # if needed

    # Start Next.js on an alternate port
    npm run dev -- -p 3001

    # Quick check (open in browser)
    open http://localhost:3001
    ```