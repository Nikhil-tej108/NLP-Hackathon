from fastapi import FastAPI
from pydantic import BaseModel
from deep_translator import GoogleTranslator

app = FastAPI()

class TranslationRequest(BaseModel):
    text: str
    target_lang: str

@app.post("/translate")
def translate_text(req: TranslationRequest):
    try:
        result = GoogleTranslator(source='auto', target=req.target_lang).translate(req.text)
        return {
            "original_text": req.text,
            "target_lang": req.target_lang,
            "translated_text": result
        }
    except Exception as e:
        return {"error": str(e)}


