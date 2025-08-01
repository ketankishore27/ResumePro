from ai_operations.utility_function import create_resume_score, get_contact_information, \
                                           get_summary_overview, get_custom_scores
from dotenv import load_dotenv

load_dotenv(override=True)

scoring_chain = create_resume_score()
contact_extractor_chain = get_contact_information()
summary_chain = get_summary_overview()
custom_score_chain = get_custom_scores()