from flask import Flask, jsonify, request
from flask_cors import CORS
from ai_operations.chains import scoring_chain

app = Flask(__name__)
CORS(app)

@app.route("/scoreResume", methods=["POST"])
def scoreResume():
    resumeText = request.get_json().get("resumeText")
    scores_resume = scoring_chain.invoke({"resume": resumeText})
    return jsonify({"score": f"{scores_resume['score']}%"})


if __name__ == "__main__":
    app.run(debug=True)

