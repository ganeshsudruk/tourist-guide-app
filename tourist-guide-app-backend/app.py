from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import json
import re
import os

# ✅ Load environment variables
load_dotenv()

# 🔑 Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ✅ Create FastAPI app
app = FastAPI(
    title=os.getenv("APP_NAME", "Tourist Guide API"),
    version=os.getenv("APP_VERSION", "3.4")
)

# ✅ Allow multiple origins
origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Request & Response Models
class PlaceRequest(BaseModel):
    place: str

class PlaceResponse(BaseModel):
    place: str
    introduction: str
    top_attractions: list[str]
    famous_foods: list[str]
    cultural_highlights: list[str]
    travel_tips: list[str]


# ✅ Model Loader Function
def get_model():
    try:
        return genai.GenerativeModel("models/gemini-flash-latest")
    except Exception:
        return genai.GenerativeModel("models/gemini-2.5-pro-preview-03-25")

model = get_model()


# ✅ Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Tourist Guide API 🌍"}


# ✅ Health Check endpoint
@app.get("/health")
def health_check():
    """
    Health check endpoint to verify backend and Gemini API connectivity.
    """
    try:
        genai.list_models()  # Light check
        return {
            "status": "healthy",
            "app_name": os.getenv("APP_NAME", "Tourist Guide API"),
            "version": os.getenv("APP_VERSION", "3.4"),
            "gemini_status": "connected ✅"
        }
    except Exception as e:
        return {
            "status": "degraded ⚠️",
            "error": str(e),
            "gemini_status": "not connected ❌"
        }


# ✅ New Endpoint — List Supported Models
@app.get("/models")
def list_supported_models():
    """
    Returns a list of all Gemini models available for your API key,
    along with their supported generation methods.
    """
    try:
        models_info = []
        for m in genai.list_models():
            models_info.append({
                "name": m.name,
                "supported_generation_methods": getattr(m, "supported_generation_methods", []),
                "description": getattr(m, "description", "No description available.")
            })
        return {
            "status": "success ✅",
            "total_models": len(models_info),
            "models": models_info
        }
    except Exception as e:
        return {
            "status": "error ❌",
            "error": str(e)
        }


# ✅ Main API endpoint
@app.post("/tourist-guide", response_model=PlaceResponse)
def tourist_guide(req: PlaceRequest):
    place = req.place.strip()

    prompt = f"""
    You are a professional tourist guide.
    Return ONLY a valid JSON object — no explanations or markdown.

    {{
      "place": "{place}",
      "introduction": "Short introduction (3-4 sentences) about {place}",
      "top_attractions": ["Top attraction 1", "Top attraction 2", "Top attraction 3", "Top attraction 4", "Top attraction 5"],
      "famous_foods": ["Famous food 1", "Famous food 2", "Famous food 3"],
      "cultural_highlights": ["Highlight 1", "Highlight 2"],
      "travel_tips": ["Tip 1", "Tip 2", "Tip 3"]
    }}
    """

    try:
        response = model.generate_content(prompt)
        text = getattr(response, "text", None)
        if not text:
            raise ValueError("Gemini did not return text")

        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise ValueError("Gemini output is not valid JSON")

        data = json.loads(match.group(0))
        return {
            "place": data.get("place", place),
            "introduction": data.get("introduction", "No introduction available."),
            "top_attractions": data.get("top_attractions", []),
            "famous_foods": data.get("famous_foods", []),
            "cultural_highlights": data.get("cultural_highlights", []),
            "travel_tips": data.get("travel_tips", [])
        }

    except Exception as e:
        return {
            "place": place,
            "introduction": f"An error occurred: {str(e)}",
            "top_attractions": [],
            "famous_foods": [],
            "cultural_highlights": [],
            "travel_tips": []
        }
