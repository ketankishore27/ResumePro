from ai_operations.utility_function import create_resume_score, get_contact_information, \
                                           get_summary_overview, get_custom_scores, \
                                           get_other_comments, functional_constituent, \
                                           technical_constituent, education_extractor, \
                                           project_extractor
from dotenv import load_dotenv

load_dotenv(override=True)

scoring_chain = create_resume_score()
contact_extractor_chain = get_contact_information()
summary_chain = get_summary_overview()
custom_score_chain = get_custom_scores()
other_comments_chain = get_other_comments()
functional_constituent_chain = functional_constituent()
technical_constituent_chain = technical_constituent()
education_extractor_chain = education_extractor()
project_extractor_chain = project_extractor()

