from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Sample resume data (in production, this would be stored in a database)
RESUMES = [
    {
        'id': 1,
        'skills': 'Python, Flask, SQL, JavaScript',
        'experience': '3+ years of web development experience',
        'content': 'Full-stack developer with expertise in Python and web technologies'
    },
    {
        'id': 2,
        'skills': 'Data Science, Machine Learning, Python',
        'experience': '2 years of data science experience',
        'content': 'Data scientist specializing in machine learning and data analysis'
    }
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def query_resumes():
    data = request.json
    job_description = data.get('description', '').lower()
    
    # Simple keyword matching
    matched_resumes = []
    for resume in RESUMES:
        if (job_description in resume['content'].lower() or 
            job_description in resume['skills'].lower() or 
            job_description in resume['experience'].lower()):
            matched_resumes.append(resume)
    
    return jsonify({'matched_resumes': matched_resumes})

@app.route('/submit_request', methods=['POST'])
def submit_request():
    data = request.json
    description = data.get('description', '')
    # In production, this would be stored in a database
    print(f"New request received: {description}")
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
