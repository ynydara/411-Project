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
        response = client.chat_completion(
            model=LLAMA_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that gives concise, clear responses."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=300,
            temperature=0.7,
        )

        print("🧠 Raw Llama response:", response)

        # Handle Hugging Face's possible return formats
        if isinstance(response, dict) and "choices" in response:
            return response["choices"][0]["message"]["content"]
        elif hasattr(response, "choices"):
            return response.choices[0].message["content"]
        elif isinstance(response, str):
            return response
        else:
            print("⚠️ Unexpected structure from HF:", response)
            return str(response)

    except Exception as e:
        print("⚠️ LLaMA generate error:", e)
        return f"Error generating response: {e}"
# --- API routes ---
@app.post("/api/classify")
def classify(req: TextRequest):
    prompt = f"How does this PR sound \n \n {req.text}"
    return {"text": req.text, "response": llama_generate(prompt), "source": "llama-classifier"}

@app.post("/api/review")
def review(req: TextRequest):
    prompt = f"Review this code professionally and suggest improvements:\n\n{req.text}"
    return {"text": req.text, "review": llama_generate(prompt), "source": "llama-review"}
import re
import json

def extract_llama_text(raw):
    """
    Extracts text from Hugging Face / Llama responses.
    Handles both structured objects and plain strings.
    """
    if not raw:
        return "No analysis found."

    # Case 1: If it's a plain string, just return it directly
    if isinstance(raw, str):
        raw = raw.strip()
        # filter out boilerplate strings
        if raw.lower().startswith("chatcompletionoutput"):
            import re
            match = re.search(r"content=['\"]([^'\"]+)['\"]", raw, re.DOTALL)
            if match:
                return match.group(1).strip()
        # otherwise it's already pure text
        return raw

    # Case 2: If it's an object/dict-like
    if hasattr(raw, "choices") and len(raw.choices) > 0:
        choice = raw.choices[0]
        if hasattr(choice, "message") and hasattr(choice.message, "content"):
            return choice.message.content.strip()
    elif isinstance(raw, dict):
        choices = raw.get("choices")
        if choices and isinstance(choices, list):
            msg = choices[0].get("message", {})
            return msg.get("content", "No analysis found.").strip()

    return "No analysis found."

@app.post("/api/analyze")
def analyze(req: TextRequest):
    text = req.text.strip()
    prompt = f"Analyze sentiment or tone of this text:\n\n{text}"

    llama_raw = llama_generate(prompt)
    extracted = extract_llama_text(llama_raw)

    print("🧠 Raw Llama response:", llama_raw)
    print("✅ Extracted text:", extracted)

    return {"review": extracted}
