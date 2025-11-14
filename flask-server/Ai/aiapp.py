
import os
import json
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from huggingface_hub import login

# ---------------------- CONFIG ------------------------
HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct"

if not HF_TOKEN:
    raise ValueError("Missing Hugging Face API key in environment variables")

login(HF_TOKEN)
print(f"🔹 Loading model: {MODEL_ID}")
generator = pipeline("text-generation", model=MODEL_ID, device_map="auto")

# ---------------------- APP INIT ----------------------
app = FastAPI(title="AI-Service", version="3.0", description="Analyzes GitHub PRs for dashboard insights")

class AnalysisRequest(BaseModel):
    type: str   # "pr" | "comment" | "code"
    content: str

@app.get("/")
def root():
    return {"status": "ok", "service": "ai-service"}


@app.post("/analyze")
def analyze(payload: AnalysisRequest):
    """
    Accepts GitHub PR, comment, or code diff and returns structured analysis data
    matching the Figma frontend schema.
    """
    try:
        prompt = build_prompt(payload.type, payload.content, payload.file)

        result = generator(
            prompt,
            max_new_tokens=400,
            temperature=0.6,
            top_p=0.9,
        )

        raw_output = result[0]["generated_text"]
        structured = parse_ai_response(raw_output)
        dashboard_obj = convert_to_dashboard_format(structured)

        return {
            "model": MODEL_ID,
            "success": True,
            "insight": dashboard_obj
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def build_prompt(data_type: str, content: str, file: str = "unknown") -> str:
    """
    Format prompt for model, instructing it to return JSON matching the dashboard
    insight schema used in the frontend.
    """

    return f"""
You are an AI that analyzes GitHub {data_type}s and generates insights for a
developer performance dashboard. The dashboard expects a single JSON object with
the following schema:

{{
  "summary": "short explanation of what the PR or comment does",
  "sentiment": "positive | neutral | negative",
  "category": "feature | bugfix | refactor | documentation | other",
  "constructiveness_score": number between 0 and 1,
  "suggestions": ["1-3 short actionable suggestions"],
  "confidence": number between 0 and 1,
  "file": "the filename from GitHub"
}}

Important rules:
- ALWAYS return valid JSON.
- NEVER include markdown or commentary outside the JSON.
- Keep responses concise and developer-friendly.
- If information is missing or ambiguous, infer the best answer.

File being analyzed: **{file}**

Content to analyze:
\"\"\" 
{content}
\"\"\"

Respond with JSON only.
"""



def parse_ai_response(output: str) -> dict:
    """Extract valid JSON from model output and safely parse."""
    match = re.search(r"\{.*\}", output, re.DOTALL)
    if not match:
        return fallback_json("Unable to parse model output")

    try:
        parsed = json.loads(match.group())
        # Ensure all required fields exist for frontend binding
        return {
            "summary": parsed.get("summary", ""),
            "sentiment": parsed.get("sentiment", "neutral"),
            "category": parsed.get("category", "other"),
            "constructiveness_score": parsed.get("constructiveness_score", 0.5),
            "suggestions": parsed.get("suggestions", []),
            "confidence": parsed.get("confidence", 0.5),
        }
    except Exception:
        return fallback_json("Invalid JSON returned from model")


def fallback_json(reason: str):
    """Fallback safe default JSON."""
    return {
        "summary": reason,
        "sentiment": "neutral",
        "category": "other",
        "constructiveness_score": 0.5,
        "suggestions": ["No valid output generated."],
        "confidence": 0.5
    }
def convert_to_dashboard_format (ai_json: dict) -> dict:
    sentiment = ai_json.get("sentiment","neutral")
    category = ai_json.get("category", "other")

    type_map = {
        "negative": "critical",
        "positive": "positive",
        "neutral": "suggestion"
    }
    type_value = type_map.get(sentiment, "suggestion")

    color_map = {
        "critical": "red",
        "suggestion": "blue",
        "positive": "green",
        "warning": "yellow"
    }

    return {
        "type": type_value,
        "title": ai_json.get("summary", "AI Insight"),
        "description": ai_json.get("suggestions", ["No description"])[0],
        "file": ai_json.get("file", "N/A"),
        "confidence": int(ai_json.get("confidence", 0.5) * 100),
        "color": color_map.get(type_value, "gray")
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
