from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModelForSeq2SeqLM
import torch
from torch.nn import functional as F

app = FastAPI(title="AI Service")

CLASSIFER_MODEL = "Akirk1213/review-classification"
clf_tokenizer = AutoTokenizer.from_pretrained(CLASSIFER_MODEL)
clf_model = AutoModelForSequenceClassification.from_pretrained(CLASSIFER_MODEL)

CODEREVIEWER_MODEL = "microsoft/codereviewer"
rev_tokenizer = AutoTokenizer.from_pretrained(CODEREVIEWER_MODEL)
rev_model = AutoModelForSeq2SeqLM.from_pretrained(CODEREVIEWER_MODEL)

# Request Model
class TextRequest(BaseModel):
    text: str

@app.post("/classify")
def classify(req: TextRequest):
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
        "scores": {labels[i]: float(p) for i, p in enumerate(probs)}

    }
@app.post("/review")
def review(req: TextRequest):
    inputs = rev_tokenizer(req.text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        tokens = rev_model.generate(
            **inputs, max_length=200, num_beams=5, early_stopping=True
        )
    review_text = rev_tokenizer.decode(tokens[0], skip_special_tokens=True)
    return {"text": req.text, "review": review_text}
@app.post("/anaylze")
def anaylze(req: TextRequest):
    # Classify
    inputs = clf_tokenizer(req.text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        clf_outputs = clf_model(**inputs)
    clf_probs = F.softmax(clf_outputs.logits, dim=-1)[0]
    clf_pred_id = clf_probs.argmax().item()
    labels = clf_model.config.id2label
    classification = {
        "prediction": labels[clf_pred_id],
        "confidence": float(clf_probs[clf_pred_id]),
        "scores": {labels[i]: float(p) for i, p in enumerate(clf_probs)}
    }
    # Review
    rev_inputs = rev_tokenizer(req.text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        rev_outputs = rev_model.generate(
            **rev_inputs, max_length=200, num_beams=5, early_stopping=True
        )
    review_text = rev_tokenizer.decode(rev_outputs[0], skip_special_tokens=True)
    return {"text": req.text, "review": review_text}