from flask import Flask, jsonify, request
from flask_cors import CORS
from ai_operations.chains import scoring_chain, contact_extractor_chain, \
                                 summary_chain, custom_score_chain, \
                                 other_comments_chain, functional_constituent_chain, \
                                 technical_constituent_chain, education_extractor_chain

app = Flask(__name__)
# CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
#      methods=["GET", "POST", "OPTIONS"],
#      allow_headers=["Content-Type", "Authorization"])

CORS(app, origins="*", 
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

@app.before_request
def log_request_info():
    print(f"Request: {request.method} {request.url}")
    print(f"Headers: {dict(request.headers)}")
    if request.is_json:
        print(f"JSON Data: {request.get_json()}")

@app.route("/test", methods=["GET", "POST"])
def test_endpoint():
    return jsonify({"status": "success", "message": "Server is working!"})

@app.route("/scoreResume", methods=["POST"])
def scoreResume():
    print("Received request for scoreResume")
    data = request.get_json()
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            scores_resume = scoring_chain.invoke({"resume": resumeText, "jobRole": jobRole})
            
            if isinstance(scores_resume, dict):
                if isinstance(scores_resume['score'], int) and isinstance(scores_resume['items'], list):
                    return jsonify({
                                    "score": f"{scores_resume['score']}%",
                                    "jobRole": jobRole,
                                    "items": scores_resume['items']
                                })

            print(scores_resume)
        except Exception as e:
            print("Exception in scoreResume:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return jsonify({    
        "score": "0.1%",
        "jobRole": jobRole,
        "items": []
    })

@app.route("/getContacts", methods=["POST"])
def getContacts():
    print("Received request for getContacts")
    data = request.get_json()
    resumeText = data.get("resumeText")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            contact_info = contact_extractor_chain.invoke({"resume_text": resumeText})
            keys_to_check = ['color', 'comment', 'email_id', 'mobile_number']
            if isinstance(contact_info, dict):
                
                if all(key in contact_info for key in keys_to_check):
                    return jsonify(contact_info)

            print(contact_info)
        except Exception as e:
            print("Exception in contactInfo:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return jsonify({    
        "color": "red",
        "comment": "Issue in Processing",
        "email_id": "",
        "mobile_number": ""
    })

@app.route("/getSummaryOverview", methods=["POST"])
def getSummaryOverview():
    print("Received request for getSummaryOverview")
    data = request.get_json()
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            summary_info = summary_chain.invoke({"resume": resumeText, "job_role": jobRole})
            keys_to_check = ['color', 'score', 'label', 'comment']
            if isinstance(summary_info, dict):
                if all(key in summary_info for key in keys_to_check):
                    return jsonify(summary_info)

            print(summary_info)
        except Exception as e:
            print("Exception in summaryInfo:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return jsonify({'score': 0,
                    'color': 'red',
                    'label': 'critical',
                    'comment': 'Issue in Processing'})

@app.route("/getCustomScores", methods=["POST"])
def getCustomScores():
    print("Received request for getCustomScores")
    data = request.get_json()
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            custom_scores_info = custom_score_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['searchibility_score', 'hard_skills_score', 'soft_skill_score', 'formatting_score']
            if isinstance(custom_scores_info, dict):
                if all(key in custom_scores_info for key in keys_to_check):
                    return jsonify(custom_scores_info)

            print(custom_scores_info)
        except Exception as e:
            print("Exception in customScores:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return jsonify({'searchibility_score': 0,
                    'hard_skills_score': 0,
                    'soft_skill_score': 0,
                    'formatting_score': 0})

@app.route("/getOtherComments", methods=["POST"])
def getOtherComments():
    print("Received request for getOtherComments")
    data = request.get_json()
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            other_comments_info = other_comments_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['headings_feedback', 'title_match', 'formatting_feedback']
            if isinstance(other_comments_info, dict):
                if all(key in other_comments_info for key in keys_to_check):
                    return jsonify(other_comments_info)

            print(other_comments_info)
        except Exception as e:
            print("Exception in otherComments:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return jsonify({'headings_feedback': '',
                    'title_match': '',
                    'formatting_feedback': ''})

@app.route("/getFunctionalConstituent", methods=["POST"])
def getFunctionalConstituent():
    print("Received request for getFunctionalConstituent")
    data = request.get_json()
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            functional_constituent_info = functional_constituent_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['constituent', 'industries', 'has_industry_experience', 'has_completed_college']
            if isinstance(functional_constituent_info, dict):
                if all(key in functional_constituent_info for key in keys_to_check):
                    return jsonify(functional_constituent_info)

            print(functional_constituent_info)
        except Exception as e:
            print("Exception in functionalConstituent:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return jsonify({'constituent': '',
                    'industries': '', 
                    'has_industry_experience': '',
                    'has_completed_college': ''})

@app.route("/getTechnicalConstituent", methods=["POST"])
def getTechnicalConstituent():
    print("Received request for getTechnicalConstituent")
    data = request.get_json()
    resumeText = data.get("resumeText")
    jobRole = data.get("jobRole", "")
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            technical_constituent_info = technical_constituent_chain.invoke({"resume_text": resumeText, "job_role": jobRole})
            keys_to_check = ['high', 'medium', 'low']
            if isinstance(technical_constituent_info, dict):
                if all(key in technical_constituent_info for key in keys_to_check):
                    return jsonify(technical_constituent_info)

            print(technical_constituent_info)
        except Exception as e:
            print("Exception in technicalConstituent:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return jsonify({'technical_exposure': ''})

@app.route("/generateCoverLetter", methods=["POST"])
def generateCoverLetter():
    print("Received request for generateCoverLetter")
    data = request.get_json()
    resumeText = data.get("resumeText")
    description = data.get("description", "")
    
    try:
        # Simple cover letter generation logic
        # In a real implementation, you would use an AI model here
        sample_cover_letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the position at your esteemed organization. Based on your requirements: {description}

With my background and experience as outlined in my resume, I am confident that I can contribute effectively to your team. My skills and expertise align well with the role requirements, and I am excited about the opportunity to bring my passion and dedication to your organization.

I have extensive experience in various domains and have successfully delivered multiple projects that demonstrate my technical capabilities and problem-solving skills. I am particularly drawn to this opportunity because it aligns with my career goals and allows me to leverage my expertise in a meaningful way.

Thank you for considering my application. I look forward to the opportunity to discuss how my background and enthusiasm can contribute to your team's success.

Sincerely,
Applicant"""
        
        return jsonify({'coverLetter': sample_cover_letter})
    except Exception as e:
        print("Exception in generateCoverLetter:", e)
        return jsonify({'error': 'Failed to generate cover letter'}), 500

@app.route("/getEducation", methods=["POST"])
def getEducation():
    print("Received request for getEducation")
    data = request.get_json()
    resumeText = data.get("resumeText")
    schema_iteration_check = 0
    
    max_iter = 5
    for iteration in range(max_iter):
        try:
            education_info = education_extractor_chain.invoke({"resume_text": resumeText})
            for ent in education_info:
                keys_to_check = ['degree', 'institution', 'start_year', 'end_year']
                if isinstance(ent, dict):
                    if all(key in ent for key in keys_to_check):
                        schema_iteration_check += 1

            if schema_iteration_check == len(education_info):
                return jsonify(education_info)
    
            print(education_info)
        except Exception as e:
            print("Exception in educationExtractor:", e)
            pass

        print("Retrying. Ended Iteration:", iteration)    
        
    return jsonify({'education_history': []})

if __name__ == "__main__":
    app.run(debug=True, threaded=True)
