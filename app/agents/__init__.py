import os
import yaml
import json
from google import genai
from google.genai import types
from app.config import settings

def load_prompt(agent_name: str) -> dict:
    prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', f'{agent_name}.yaml')
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

def generate_json_from_gemini(
    system_instruction: str, 
    content: str, 
    model_name: str = None, 
    image_bytes: bytes = None,
    image_mime_type: str = "image/jpeg" # <--- YENİ PARAMETRE
) -> dict:
    model = model_name or settings.GEMINI_MODEL
    
    try:
        contents_list = [
            types.Part.from_text(system_instruction),
            types.Part.from_text(content)
        ]
        
        # Görüntü varsa, dinamik mime_type ile ekle
        if image_bytes:
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=image_mime_type # <--- ARTIK SABİT DEĞİL, DİNAMİK!
            )
            contents_list.append(image_part)

        response = client.models.generate_content(
            model=model,
            contents=contents_list,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        data = response.text
        data = data.replace("```json", "").replace("```", "").strip()
        return json.loads(data)
    except Exception as e:
        print(f"GenAI çağrı hatası: {e}")
        return {}