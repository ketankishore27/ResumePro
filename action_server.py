from flask import Flask, jsonify, request
from flask_cors import CORS
from ai_operations.chains import scoring_chain, contact_extractor_chain, \
                                 summary_chain, custom_score_chain

app = Flask(__name__)
CORS(app)

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


if __name__ == "__main__":
    app.run(debug=True, threaded=True)

