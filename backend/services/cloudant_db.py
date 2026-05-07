import os
import logging
from ibmcloudant.cloudant_v1 import CloudantV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

logger = logging.getLogger(__name__)

# Load configurations
CLOUDANT_APIKEY = os.environ.get("IBM_CLOUDANT_APIKEY")
CLOUDANT_URL = os.environ.get("IBM_CLOUDANT_URL")
DB_NAME = "credify_verifications"

client = None

def init_cloudant():
    """Initializes the IBM Cloudant client and ensures the target database exists."""
    global client
    if not CLOUDANT_APIKEY or not CLOUDANT_URL:
        logger.warning("IBM Cloudant credentials not found. Cloudant persistence is disabled.")
        return False
        
    try:
        authenticator = IAMAuthenticator(CLOUDANT_APIKEY)
        client = CloudantV1(authenticator=authenticator)
        client.set_service_url(CLOUDANT_URL)
        
        # Ensure database exists
        try:
            client.get_database_information(db=DB_NAME).get_result()
            logger.info(f"Connected to existing IBM Cloudant database: '{DB_NAME}'")
        except Exception as e:
            if "not_found" in str(e).lower() or getattr(e, 'code', None) == 404:
                logger.info(f"Database '{DB_NAME}' not found. Creating it...")
                client.put_database(db=DB_NAME).get_result()
                logger.info(f"IBM Cloudant database '{DB_NAME}' created successfully.")
            else:
                raise e
        return True
    except Exception as e:
        logger.error(f"Failed to initialize IBM Cloudant: {e}")
        client = None
        return False

# Attempt to initialize on module load
init_cloudant()

def save_verification_to_cloudant(response_data: dict, api_key_name: str = "Unknown"):
    """
    Saves a complete verification response document to IBM Cloudant.
    It builds a clear, searchable document schema.
    """
    if not client:
        return
        
    try:
        # Build document schema matching IBM Cloudant best practices
        document = {
            # Use the claim_id as the CouchDB _id so it acts as a unique primary key
            "_id": response_data.get("claim_id", ""),
            "type": "verification_record",
            "search_query": response_data.get("original_text", ""),
            "api_key_used": api_key_name,
            "verification_result": {
                "score": response_data.get("truth_score"),
                "status": response_data.get("classification"),
                "confidence": response_data.get("confidence"),
                "reasoning_summary": response_data.get("reasoning", "")
            },
            # Store the raw evidence array for deeper inspection in the dashboard
            "evidence_sources_count": len(response_data.get("evidences", [])),
            "evidence_details": [
                {
                    "source": ev.get("source_name"),
                    "stance": ev.get("stance"),
                    "url": ev.get("url")
                } for ev in response_data.get("evidences", [])
            ],
            # Add ISO timestamp for sorting in Cloudant dashboard
            "timestamp": response_data.get("timestamp", "")
        }
        
        # Save to IBM Cloudant
        client.post_document(
            db=DB_NAME,
            document=document
        ).get_result()
        
        logger.info(f"☁️ Saved verification {document['_id']} to IBM Cloudant successfully.")
    except Exception as e:
        if "conflict" in str(e).lower() or getattr(e, 'code', None) == 409:
             logger.info(f"☁️ Document {response_data.get('claim_id')} already exists in IBM Cloudant.")
        else:
             logger.error(f"Failed to save to IBM Cloudant: {e}")
