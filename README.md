# ResumePro — Career Development Tool

An AI-powered resume insights and career tooling suite with a FastAPI backend and a Next.js frontend.

- Backend: FastAPI ([action_server.py](./action_server.py:0:0-0:0)), LangChain-based AI chains, PostgreSQL via SQLAlchemy
- Frontend: Next.js + Material UI, Chart.js
- Database: PostgreSQL (JSON-heavy schema for analysis outputs)

![Dashboard Page 1](git%20images/Dashboard%20Page1.png)
![Dashboard Page 2](git%20images/Dashboard%20Page2.png)
![Dashboard Page 3](git%20images/Dashboard%20Page3.png)

---

## Table of Contents
- Overview
- Features
- Architecture
- Frontend Operations
- Backend Operations (API)
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

- Resume insights: overall score, custom scores, summary analysis
- Contact extraction, education history, projects, employment timeline
- Functional and technical exposure breakdown
- Unified DB query endpoint
- Bulk import processing with visual progress
- AI cover letter generation

![Query Candidate](git%20images/Query%20Candidate.png)
![Bulk Import Facility](git%20images/Bulk-Import%20Facility.png)

---

## Architecture

- Frontend (Next.js) in `frontend/`
  - Talks to FastAPI at `http://127.0.0.1:8000`
- Backend (FastAPI) in project root [action_server.py](./action_server.py:0:0-0:0)
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

- Scripts ([frontend/package.json](./frontend/package.json:0:0-0:0)):
  - `npm run dev` — start dev server (Next.js)
  - `npm run build` — build
  - `npm run start` — run production build

- Image policy: see [frontend/next.config.js](./frontend/next.config.js:0:0-0:0) for remote image patterns (Unsplash)

---

## Backend Operations (API)

Server entry: [action_server.py](./action_server.py:0:0-0:0)  
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

- POST `/assembleData`  
  Req: assembled payload with inputs and the above endpoint outputs  
  Res: `{ response }` (persists to DB)

- POST `/processBulkImport`  
  Orchestrates analysis calls and persistence for a resume item  
  Res: `{ email_id, contact_number, name, summary_overview, score_resume, parsed_status }`

- POST `/extractData`  
  Unified DB query  
  Req: `{ email_id }`  
  Res: candidate record from DB or a 404-style payload

---

## Database

Location: [db_operations/utility_db.py](./db_operations/utility_db.py:0:0-0:0)

- Connection (adjust as needed):
  `postgresql+psycopg2://postgres:resume_db@localhost:5432/postgres`
- Table name comes from env var `TABLE_NAME` (required)
- Writes JSON columns for endpoint outputs; upserts by `email_id`
- [extract_data(email_id)](cci:1://file:///Users/A118390615/Library/CloudStorage/OneDrive-DeutscheTelekomAG/Projects/COE_Projects/CareerDevelopmentTool/db_operations/utility_db.py:120:0-126:15) reads from `TABLE_NAME` and returns a record (minus raw text, mode, candidate_id)

---

## Setup and Run

Prerequisites:
- Python 3.12+
- Node.js 18+ and npm
- PostgreSQL running locally

Python dependencies are managed in [pyproject.toml](./pyproject.toml:0:0-0:0):
- FastAPI, Uvicorn, LangChain libs, Pandas, Psycopg2, Pydantic, python-dotenv, etc.

1) Backend
- Install deps (choose one approach):
  - Using uv/pip:
    - `pip install uv` (if not installed)
    - `uv pip install -r pyproject.toml` (or `pip install -e .` with PEP 621 aware tooling)
  - Or install packages explicitly per [pyproject.toml](./pyproject.toml:0:0-0:0)
- Set env:
  - `export TABLE_NAME=<your_table_name>`
  - Ensure the Postgres connection string in [db_operations/utility_db.py](./db_operations/utility_db.py:0:0-0:0) matches your credentials
  - Optional: use a `.env` file (dotenv is loaded)
- Run FastAPI:
  - `uvicorn action_server:app --host 0.0.0.0 --port 8000`

2) Frontend
- `cd frontend`
- `npm install`
- `npm run dev`
- Open: `http://localhost:3000` (frontend talks to backend on `http://127.0.0.1:8000`)

---

## Usage Walkthrough

- Landing section
  - Enter Name, Job Role, Location
  - Upload resume (single centralized upload)
- Query Candidate / Insights
  - Analyzes resume, renders scores, summary, contact info, functional/technical exposure, projects, employment timeline, education
- Resume Requests
  - Generates a cover letter via `/generateCoverLetter` based on resume text and description
- Bulk Import
  - Processes multiple resumes with visual progress (Linear + Circular indicators)
  - Shows current file, percentage, and completion

Additional views:
![Dashboard Page 4](git%20images/Dashboard%20Page4.png)
![Dashboard Page 5](git%20images/Dashboard%20Page5.png)
![Dashboard Page 6](git%20images/Dashboard%20Page6.png)

---

## Environment Variables

- `TABLE_NAME`: required; DB table used by `/assembleData` and `/extractData`
- Optional provider keys for LangChain integrations if you enable external LLMs; never hardcode secrets

---

## Troubleshooting

- Backend unreachable:
  - Ensure `uvicorn` is running on port 8000, check logs
- DB errors:
  - Verify Postgres is running, `TABLE_NAME` is set, and credentials in [utility_db.py](./db_operations/utility_db.py:0:0-0:0)
- CORS:
  - Already enabled for all origins in [action_server.py](./action_server.py:0:0-0:0)
- Frontend build issues:
  - Use Node 18+, `npm install` cleanly, and check [frontend/next.config.js](./frontend/next.config.js:0:0-0:0) if loading external images