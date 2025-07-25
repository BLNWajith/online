from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from executor import execute_code
import deepseek
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import re

load_dotenv()

app = FastAPI()

# Allow all CORS origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    version: str = "3.10"

class ExplainRequest(BaseModel):
    code: str

def sanitize_code(code: str) -> str:
    # Remove non-printable characters and trim whitespace
    code = re.sub(r'[^\x09-\x0d\x20-\x7e\n]', '', code)
    return code.strip()

@app.post("/run")
def run_code(req: CodeRequest):
    output = execute_code(req.code, req.language, req.version)
    return {"output": output}

@app.post("/explain")
def explain(req: ExplainRequest):
    code = sanitize_code(req.code)
    if not code:
        raise HTTPException(status_code=400, detail="No code provided.")
    try:
        explanation = deepseek.explain_code(code)
        return {"explanation": explanation}
    except Exception as e:
        return {"explanation": "Error: Could not get explanation. Please try again later."}

@app.post("/rectify")
def rectify(req: ExplainRequest):
    code = sanitize_code(req.code)
    if not code:
        raise HTTPException(status_code=400, detail="No code provided.")
    try:
        corrected = deepseek.rectify_code(code)
        return {"corrected_code": corrected}
    except Exception as e:
        return {"corrected_code": "Error: Could not rectify code. Please try again later."}
