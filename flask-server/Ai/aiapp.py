from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModelForSeq2SeqLM
import torch
from torch.nn import functional as F

app = FastAPI(title="AI Service")

# --- Load Models ---
CLASSIFIER_MODEL = "Akirk1213/review-classification"
clf_tokenizer = AutoTokenizer.from_pretrained(CLASSIFIER_MODEL)
clf_model = AutoModelForSequenceClassification.from_pretrained(CLASSIFIER_MODEL)

CODEREVIEWER_MODEL = "microsoft/codereviewer"
rev_tokenizer = AutoTokenizer.from_pretrained(CODEREVIEWER_MODEL)
rev_model = AutoModelForSeq2SeqLM.from_pretrained(CODEREVIEWER_MODEL)

# --- Request schema ---
class TextRequest(BaseModel):
    text: str

# --- Utility: Detect if input looks like code ---
def is_code_like(text: str) -> bool:
    code_signals = [";", "{", "}", "def ", "class ", "function ", "=>", "import "]
    return any(sig in text for sig in code_signals)


# --- Classifier ---
@app.post("/classify")
def classify(req: TextRequest):
    try:
        inputs = clf_tokenizer(req.text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = clf_model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1)[0]
        pred_id = probs.argmax().item()
        labels = clf_model.config.id2label

        return {
            "text": req.text,
            "prediction": labels[pred_id],
            "confidence": float(probs[pred_id]),
            "scores": {labels[i]: float(p) for i, p in enumerate(probs)},
            "source": "classifier"
        }
    except Exception as e:
        return {"error": str(e)}


# --- Code Reviewer ---
@app.post("/review")
def review(req: TextRequest):
    try:
        inputs = rev_tokenizer(req.text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            tokens = rev_model.generate(
                **inputs, max_length=200, num_beams=5, early_stopping=True
            )
        review_text = rev_tokenizer.decode(tokens[0], skip_special_tokens=True)

        # Clean artifacts
        review_text = review_text.replace("<e0>", "").replace("</s>", "").strip()

        return {"text": req.text, "review": review_text, "source": "codereviewer"}
    except Exception as e:
        return {"error": str(e)}


# --- Auto Analyze (smart routing) ---
@app.post("/analyze")
def analyze(req: TextRequest):
    text = req.text.strip()

    if is_code_like(text):
        # Route to CodeReviewer
        inputs = rev_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            tokens = rev_model.generate(
                **inputs, max_length=200, num_beams=5, early_stopping=True
            )
        review_text = rev_tokenizer.decode(tokens[0], skip_special_tokens=True)
        review_text = review_text.replace("<e0>", "").replace("</s>", "").strip()

        return {"text": text, "review": review_text, "source": "codereviewer"}

    else:
        # Route to Classifier
        inputs = clf_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = clf_model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1)[0]
        pred_id = probs.argmax().item()
        labels = clf_model.config.id2label

        return {
            "text": text,
            "prediction": labels[pred_id],
            "confidence": float(probs[pred_id]),
            "scores": {labels[i]: float(p) for i, p in enumerate(probs)},
            "source": "classifier"
        }