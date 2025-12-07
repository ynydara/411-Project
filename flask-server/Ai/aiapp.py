import os
import json
import re
import traceback
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from huggingface_hub import InferenceClient

HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
MODEL_ID = "meta-llama/Meta-Llama-3.1-8B-Instruct"

if not HF_TOKEN:
    raise ValueError("Missing Hugging Face API key in environment variables")

# Use HF Inference API instead of loading model locally
client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)
print(f"🔹 Using HF Inference API model: {MODEL_ID}")

app = FastAPI(title="AI-Service", version="3.0")


class AnalysisRequest(BaseModel):
    type: str   # "pr" | "comment" | "code"
    content: str
    file: str = "unknown"


@app.get("/")
def root():
    return {"status": "ok", "service": "ai-service"}

@app.post("/api/analyze")
def analyze(payload: AnalysisRequest):
    try:

        system_msg = (
            "You are an AI that analyzes GitHub pull requests, comments, or code "
            "and returns ONLY JSON in a fixed schema. Do not include markdown or text "
            "outside the JSON object."
        )

        user_prompt = build_prompt(payload.type, payload.content, payload.file)

        resp = client.chat_completion(
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=300,
            temperature=0.6,
            top_p=0.9,
        )

        # HF returns an object; extract the text
        raw_output = resp.choices[0].message["content"]
        print("🔹 HF output (truncated):", repr(raw_output)[:200])

        structured = parse_ai_response(raw_output)
        dashboard_obj = convert_to_dashboard_format(structured)

        return {
            "model": MODEL_ID,
            "success": True,
            "data": structured,
            "insight": dashboard_obj,
        }
    except Exception as e:
        print("Error in /api/analyze:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"HF error: {e}")


def build_prompt(data_type: str, content: str, file: str = "unknown") -> str:
    return f"""
You are an AI that analyzes GitHub {data_type}s. Pr's, and Comments. Please give us explanations of PR reviews and
how to better right PR's/ Handle issues. Look at code syntax for error analysis on code basis in PR's.

Return ONLY valid JSON in exactly this schema and value ranges:

{{
  "summary": "short explanation (string)",
  "sentiment": "positive" | "neutral" | "negative",
  "category": "feature" | "bugfix" | "refactor" | "documentation" | "other",
  "constructiveness_score": number between 0 and 1,
  "suggestions": ["1-3 short actionable suggestions (strings)"],
  "confidence": number between 0 and 1,
  "file": "{file}"
}}

Do not include any extra keys. Do not include markdown or explanation outside the JSON.

Content:
\"\"\" 
{content}
\"\"\" 
"""


def parse_ai_response(output: str) -> dict:
    match = re.search(r"\{.*\}", output, re.DOTALL)

    def fallback_json(reason: str):
        return {
            "summary": reason,
            "sentiment": "neutral",
            "category": "other",
            "constructiveness_score": 0.5,
            "suggestions": ["No valid output generated."],
            "confidence": 0.5,
            "file": "unknown",
        }

    if not match:
        return fallback_json("Unable to parse model output")

    try:
        parsed = json.loads(match.group())

        raw_sentiment = parsed.get("sentiment", "neutral")
        raw_category = parsed.get("category", "other")
        raw_construct = parsed.get("constructiveness_score")
        raw_confidence = parsed.get("confidence", 0.5)

        if raw_sentiment not in {"positive", "neutral", "negative"}:
            raw_sentiment = "neutral"

        if raw_category not in {"feature", "bugfix", "refactor", "documentation", "other"}:
            raw_category = "other"

        try:
            constructiveness = float(raw_construct)
        except (TypeError, ValueError):
            constructiveness = 0.5
        constructiveness = max(0.0, min(1.0, constructiveness))

        try:
            confidence = float(raw_confidence)
        except (TypeError, ValueError):
            confidence = 0.5
        confidence = max(0.0, min(1.0, confidence))

        return {
            "summary": parsed.get("summary", ""),
            "sentiment": raw_sentiment,
            "category": raw_category,
            "constructiveness_score": constructiveness,
            "suggestions": parsed.get("suggestions", []),
            "confidence": confidence,
            "file": parsed.get("file", "unknown"),
        }
    except Exception:
        return fallback_json("Invalid JSON returned from model")

def convert_to_dashboard_format(ai_json: dict) -> dict:
    type_map = {
        "negative": "critical",
        "positive": "positive",
        "neutral": "suggestion",
    }
    sentiment = ai_json.get("sentiment", "neutral")
    type_value = type_map.get(sentiment, "suggestion")

    return {
        "type": type_value,
        "title": ai_json["summary"],
        "description": ai_json["suggestions"][0] if ai_json["suggestions"] else "",
        "file": ai_json["file"],
        "confidence": int(ai_json["confidence"] * 100),
        "color": {
            "critical": "red",
            "suggestion": "blue",
            "positive": "green",
        }.get(type_value, "gray"),
    }
