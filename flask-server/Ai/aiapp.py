from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import dotenv_values
from huggingface_hub import InferenceClient
import os

app = FastAPI(title="AI Service")

# --- Load API Key properly ---
HF_API_KEY = os.getenv("HUGGINGFACE_API_TOKEN") or dotenv_values("huggingFaceConfig.env").get("HUGGINGFACE_API_TOKEN")

if not HF_API_KEY:
    raise ValueError("No Hugging Face API token found in environment or huggingFaceConfig.env")

client = InferenceClient(token=HF_API_KEY)

LLAMA_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
# --- Request schema ---
class TextRequest(BaseModel):
    text: str

# --- Utility ---
def is_code_like(text: str) -> bool:
    code_signals = [";", "{", "}", "def ", "class ", "function ", "=>", "import "]
    return any(sig in text for sig in code_signals)

# --- LLaMA generate ---
def llama_generate(prompt: str) -> str:
    try:
        response = client.text_generation(
            prompt,
            max_new_tokens=300,
            temperature=0.7,
            repetition_penalty=1.1,
        )

        if isinstance(response, dict) and "generated_text" in response:
            return response["generated_text"]
        elif isinstance(response, list) and len(response) > 0 and "generated_text" in response[0]:
            return response[0]["generated_text"]
        elif hasattr(response, "generated_text"):
            return response.generated_text
        else:
            print("⚠️ Unexpected response structure:", response)
            return str(response)

    except Exception as e:
        print("⚠️ LLaMA generate error:", e)
        raise

# --- API routes ---
@app.post("/api/classify")
def classify(req: TextRequest):
    prompt = f"How does this PR sound \n \n {req.text}"
    return {"text": req.text, "response": llama_generate(prompt), "source": "llama-classifier"}

@app.post("/api/review")
def review(req: TextRequest):
    prompt = f"Review this code professionally and suggest improvements:\n\n{req.text}"
    return {"text": req.text, "review": llama_generate(prompt), "source": "llama-review"}

@app.post("/api/analyze")
def analyze(req: TextRequest):
    text = req.text.strip()
    if is_code_like(text):
        prompt = f"Review this code professionally:\n\n{text}"
        return {"text": text, "review": llama_generate(prompt), "source": "llama-review"}
    else:
        prompt = f"Analyze sentiment or tone of the text (positive, negative, neutral):\n\n{text}"
        return {"text": text, "analysis": llama_generate(prompt), "source": "llama-classifier"}
