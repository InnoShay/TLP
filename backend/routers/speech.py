import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from ibm_watson import SpeechToTextV1, TextToSpeechV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

router = APIRouter(prefix="/api/speech", tags=["Speech Services"])

# IBM Configuration
STT_API_KEY = os.environ.get("IBM_STT_API_KEY")
STT_URL = os.environ.get("IBM_STT_URL")
TTS_API_KEY = os.environ.get("IBM_TTS_API_KEY")
TTS_URL = os.environ.get("IBM_TTS_URL")

@router.post("/stt")
async def speech_to_text(audio: UploadFile = File(...), mime_type: str = Form("audio/webm")):
    if not STT_API_KEY or not STT_URL:
        raise HTTPException(status_code=500, detail="IBM STT is not configured.")
        
    authenticator = IAMAuthenticator(STT_API_KEY)
    stt = SpeechToTextV1(authenticator=authenticator)
    stt.set_service_url(STT_URL)

    try:
        # Read the audio bytes uploaded from the frontend
        audio_content = await audio.read()
        
        # Clean mime_type just in case it has codecs appended which IBM might reject
        safe_mime = mime_type.split(";")[0] if mime_type else "audio/webm"
        
        # Call IBM Watson STT
        response = stt.recognize(
            audio=audio_content,
            content_type=safe_mime,
            model='en-US_Multimedia'
        ).get_result()
        
        # Extract the transcript
        if response.get("results"):
            transcript = response["results"][0]["alternatives"][0]["transcript"]
            return {"text": transcript.strip()}
        return {"text": ""}
    except Exception as e:
        print(f"STT Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tts")
async def text_to_speech(text: str = Form(...)):
    if not TTS_API_KEY or not TTS_URL:
        raise HTTPException(status_code=500, detail="IBM TTS is not configured.")
        
    authenticator = IAMAuthenticator(TTS_API_KEY)
    tts = TextToSpeechV1(authenticator=authenticator)
    tts.set_service_url(TTS_URL)

    try:
        # Call IBM Watson TTS
        response = tts.synthesize(
            text,
            voice='en-US_AllisonV3Voice',
            accept='audio/mp3'
        ).get_result()
        
        # Return the audio bytes directly to the frontend
        return Response(content=response.content, media_type="audio/mp3")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
