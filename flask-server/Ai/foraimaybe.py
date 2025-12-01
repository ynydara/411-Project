# import os
# import json
# import re
# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
# from huggingface_hub import login
# import asyncio
#
# # ---------------------- CONFIG ------------------------
# HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
# MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct"
#
# if not HF_TOKEN:
#     raise ValueError("Missing Hugging Face API key in environment variables")
#
# login(HF_TOKEN)
# print(f" Loading tokenizer: {MODEL_ID}")
# tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
#
# print(f"🔹 Loading model: {MODEL_ID}")
# #generator = pipeline("text-generation", model=MODEL_ID, device_map="auto")
# model = AutoModelForCausalLM.from_pretrained(
#     MODEL_ID,
#     token=HF_TOKEN,
#     device_map="auto",
#     torch_dtype="auto",
#     low_cpu_mem_usage=True,
#     offload_folder="/app/hf_cache"
# )
#
# model.config.pad_token_id = tokenizer.eos_token_id
#
# generator = pipeline(
#     "text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     return_full_text=False
# )
# # ---------------------- APP INIT ----------------------
# app = FastAPI(title="AI-Service", version="3.0", description="Analyzes GitHub PRs for dashboard insights")
#
# class AnalysisRequest(BaseModel):
#     type: str   # "pr" | "comment" | "code"
#     content: str
#
# @app.get("/")
# def root():
#     return {"status": "ok", "service": "ai-service"}
#
# async def generate_ai_response(prompt: str):
#     """Run blocking generator in a separate thread with timeout."""
#     try:
#         return await asyncio.wait_for(
#             asyncio.to_thread(
#                 lambda: generator(
#                     prompt,
#                     max_new_tokens=128,
#                     temperature=0.1,
#                     top_p=0.9,
#                     do_sample=True,
#                     return_full_text=False,
#                 )
#             ),
#             timeout=300
#         )
#     except asyncio.TimeoutError:
#         return None
#
#
# def extract_raw_output(result):
#     """Extracts text from any HF pipeline return shape."""
#     if not result:
#         return None
#
#     # Case 1: Single dict
#     if isinstance(result, dict):
#         return result.get("generated_text") or result.get("text")
#
#     # Case 2: List of dicts
#     if isinstance(result, list) and len(result) > 0:
#         item = result[0]
#         if isinstance(item, dict):
#             return item.get("generated_text") or item.get("text")
#
#     return None
#
#
# """
# Accepts GitHub PR, comment, or code diff and returns structured analysis data
# matching the Figma frontend schema.
# """
# @app.post("/api/analyze")
# async def analyze(payload: AnalysisRequest):
#     prompt = build_prompt(payload.type, payload.content)
#
#     try:
#         result = await generate_ai_response(prompt)
#         print("DEBUG: model raw result =", result)
#
#         raw_output = extract_raw_output(result)
#         if not raw_output:
#             return {
#                 "model": MODEL_ID,
#                 "success": False,
#                 "data": fallback_json("Model returned no usable text")
#             }
#
#         structured = parse_ai_response(raw_output)
#
#         return {
#             "model": MODEL_ID,
#             "success": True,
#             "data": structured,
#         }
#
#     except Exception as e:
#         print("ERROR in /api/analyze:", e)
#         import traceback; traceback.print_exc()
#
#         raise HTTPException(
#             status_code=500,
#             detail=f"ai-service internal error: {str(e)}"
#         )
#
# def build_prompt(data_type: str, content: str) -> str:
#     """Format prompt for model, instructing it to return JSON matching Figma dashboard schema."""
#     return f"""
# Analyze the following {data_type}:
#
# {content}
#
# You are an AI that analyzes GitHub {data_type}s to provide metrics for a developer performance dashboard.
# NEVER add commentary, never add markdown, never add quotes outside JSON.
# Follow the rules strictly.
#
# Use the following rubric to assign a sentiment:
# - positive = expresses satisfaction, praise, approval
# - neutral = factual, mixed, or no emotional content
# - negative = expresses frustration, dislike, or complaint
#
# Use the following rubric to assign a category:
# - feature = asks for a new capability
# - bugfix = describes a problem or malfunction
# - refactor = suggests internal code improvement
# - documentation = asks for better explanation or examples
# - other = doesn’t fit any category above
#
# Use the following rubric to assign a constructiveness_score:
#  - 0.0–0.2:  not constructive (complaint, insult, vague)
#  - 0.3–0.6:  somewhat constructive
#  - 0.7–1.0:  actionable, helpful, detailed
#
# Sentiment values:
# - positive = 1
# - neutral = 0.5
# - negative = 0
#
# Score (0–100):
# - Combine helpfulness + clarity + tone:
#   score = (constructiveness_score * 0.6 + sentiment_value * 0.4) * 100
#
# Respond ONLY with this JSON schema:
#
# {{
#   "summary": "",
#   "sentiment": "",
#   "category": "",
#   "constructiveness_score": 0,
#   "suggestions": [],
#   "confidence": 0,
#   "score": 0
# }}
#
# DO NOT include any extra text, explanation, or commentary.
# """
#
#
# def parse_ai_response(output: str) -> dict:
#     try:
#         cleaned = output.strip()
#
#         start = cleaned.find("{")
#         end = cleaned.rfind("}")
#
#         if start == -1 or end == -1:
#             return fallback_json("No JSON found in model output")
#
#         json_str = cleaned[start:end + 1]
#         parsed = json.loads(json_str)
#
#         return {
#             "summary": parsed.get("summary", ""),
#             "sentiment": parsed.get("sentiment", "neutral"),
#             "category": parsed.get("category", "other"),
#             "constructiveness_score": parsed.get("constructiveness_score", 0.5),
#             "suggestions": parsed.get("suggestions", []),
#             "confidence": parsed.get("confidence", 0.5),
#             "score": parsed.get("score", 0.5)
#         }
#
#     except Exception as e:
#         print("JSON parse error:", e)
#         return fallback_json("Invalid JSON returned from model")
#
#
#     #match = re.search(r"\{.*\}", output, re.DOTALL)
#     # if not match:
#     #     return fallback_json("Unable to parse model output")
#         # parsed = json.loads(match.group())
#         # Ensure all required fields exist for frontend binding
#
#         return fallback_json("Unable to find JSON in model output")
#
#
#
# def fallback_json(reason: str):
#     """Fallback safe default JSON."""
#     return {
#         "summary": reason,
#         "sentiment": "neutral",
#         "category": "other",
#         "constructiveness_score": 0.5,
#         "suggestions": ["No valid output generated."],
#         "confidence": 0.5,
#         "score": 0.5
#     }
#
#
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
