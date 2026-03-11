import logging
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import run_firereach_agent
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("FireReach")

app = FastAPI(title="FireReach API")
VERSION = "1.2.1"

@app.on_event("startup")
async def startup_event():
    logger.info("="*50)
    logger.info(f"FireReach API Version {VERSION} starting...")
    logger.info(f"GROQ_API_KEY loading: {'LOADED' if settings.GROQ_API_KEY else 'MISSING'}")
    logger.info(f"SERPER_API_KEY loading: {'LOADED' if settings.SERPER_API_KEY else 'MISSING'}")
    logger.info(f"RESEND_API_KEY loading: {'LOADED' if settings.RESEND_API_KEY else 'MISSING'}")
    logger.info("="*50)

@app.get("/")
async def root():
    logger.info(f"Root endpoint hit (v{VERSION})")
    return {"message": "FireReach API is Live!", "version": VERSION, "status": "running"}


# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentRequest(BaseModel):
    company: str
    icp: str
    email: str

class AgentResponse(BaseModel):
    signals: list[str]
    research: str
    email: str
    target_email: str = None

@app.post("/run-agent", response_model=AgentResponse)
async def run_agent(request: AgentRequest):
    logger.info(f"Received run-agent request for company: {request.company}")
    try:
        result = run_firereach_agent(
            company=request.company,
            icp=request.icp,
            email=request.email
        )
        logger.info(f"Agent execution completed for {request.company}")
        return AgentResponse(
            signals=result.get("signals", []),
            research=result.get("research", ""),
            email=result.get("email", ""),
            target_email=result.get("target_email", request.email)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "ok"}
