from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from torch.nn import functional as F

model_name = "Akirk1213/review-classification"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

text = "Thanks"
inputs = tokenizer(text, return_tensors="pt")

with torch.no_grad():
    outputs = model(**inputs)

probs = F.softmax(outputs.logits, dim=-1)[0]
pred_id = probs.argmax().item()
labels = model.config.id2label

print("Input:", text)
print("Prediction:", labels[pred_id])
print("Confidence:", probs[pred_id].item())
print("All Scores:")
for i, p in enumerate(probs):
    print(f"  {labels[i]}: {p.item():.4f}")
