from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import requests
from config import settings
from email_service import send_email
from agent import run_firereach_agent
from tools import tool_company_search, tool_signal_harvester

app = FastAPI(title="FireReach API")
VERSION = "1.3.0"

@app.get("/")
async def root():
    print(f"[{VERSION}] Root endpoint hit", flush=True)
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
    icp: str
    company: str = ""
    email: str = ""

class AgentResponse(BaseModel):
    signals: list[str]
    research: str
    email: str
    target_email: str = None
    target_company: str = None
    target_person: str = None

class ManualEmailRequest(BaseModel):
    email: str
    company: str = ""
    icp: str = ""

class SendManualEmailRequest(BaseModel):
    email: str
    body: str
    subject: str = "Outreach from FireReach"

@app.post("/run-agent", response_model=AgentResponse)
async def run_agent(request: AgentRequest):
    print(f"[{VERSION}] Received run-agent request for company: {request.company}", flush=True)
    try:
        result = run_firereach_agent(
            company=request.company,
            icp=request.icp,
            email=request.email
        )
        print(f"[{VERSION}] Agent execution completed for {request.company}", flush=True)
        return AgentResponse(
            signals=result.get("signals", []),
            research=result.get("research", ""),
            email=result.get("email", ""),
            target_email=result.get("target_email", request.email),
            target_company=result.get("target_company", request.company),
            target_person=result.get("target_person", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# --- HUMAN IN THE LOOP ENDPOINTS ---

class DiscoverCompaniesRequest(BaseModel):
    icp: str

@app.post("/discover-companies")
async def discover_companies(request: DiscoverCompaniesRequest):
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage, SystemMessage
    try:
        api_key = settings.GROQ_API_KEY
        if api_key:
            chat = ChatGroq(temperature=0.4, groq_api_key=api_key, model_name="llama-3.1-8b-instant")
            messages = [
                SystemMessage(content="You are a B2B sales expert. Based on the provided Ideal Customer Profile (ICP), generate a JSON array of 5 exact, real-world company names that fit this profile. Output ONLY a valid JSON array of strings. Do not include markdown blocks or any other text."),
                HumanMessage(content=f"ICP: {request.icp}")
            ]
            
            response = chat.invoke(messages).content.strip()
            
            # Clean up potential markdown formatting
            if response.startswith("```json"):
                response = response[7:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            companies_list = json.loads(response)
        else:
            # Fallback if no GROQ key
            companies_str = tool_company_search.invoke({"icp": request.icp})
            companies_list = json.loads(companies_str) if isinstance(companies_str, str) and "[" in companies_str else []

        if not isinstance(companies_list, list) or len(companies_list) == 0:
            companies_list = ["Acme Corp", "TechFlow", "DataSync", "CloudScale", "DevWorks"]
            
        # Add stub signals to show in the UI for the company selection
        results = []
        for comp in companies_list[:5]:
            results.append({"name": comp, "signals": ["Growing fast", "Matches ICP"]})
            
        return {"companies": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to discover companies: {str(e)}")


class GetContactsRequest(BaseModel):
    company: str

def get_multiple_leads(company: str) -> list:
    serper_api_key = settings.SERPER_API_KEY
    hunter_api_key = settings.HUNTER_API_KEY
    domain = company.lower().replace(" ", "").replace(".com", "").replace(".io", "").replace(".co", "")
    
    if "." not in company and serper_api_key:
        url = "https://google.serper.dev/search"
        payload = json.dumps({"q": f"{company} official website domain"})
        headers = {'X-API-KEY': serper_api_key, 'Content-Type': 'application/json'}
        try:
            response = requests.request("POST", url, headers=headers, data=payload)
            data = response.json()
            if 'organic' in data and data['organic']:
                link = data['organic'][0].get('link', '')
                from urllib.parse import urlparse
                domain = urlparse(link).netloc
                if domain.startswith("www."):
                    domain = domain[4:]
        except:
            pass

    contacts = []
    if hunter_api_key:
        url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={hunter_api_key}"
        try:
            response = requests.get(url)
            data = response.json()
            if 'data' in data and data['data'].get('emails'):
                for email_data in data['data']['emails'][:5]:
                    first_name = email_data.get('first_name', '')
                    last_name = email_data.get('last_name', '')
                    position = email_data.get('position', 'Decision Maker') or "Decision Maker"
                    name = f"{first_name} {last_name}".strip() or "Unknown"
                    contacts.append({
                        "name": name,
                        "role": position,
                        "email": email_data.get('value')
                    })
        except:
            pass
            
    if not contacts and serper_api_key:
        url = "https://google.serper.dev/search"
        query = f"{company} {domain} CEO CTO Head email"
        payload = json.dumps({"q": query})
        headers = {'X-API-KEY': serper_api_key, 'Content-Type': 'application/json'}
        try:
            response = requests.request("POST", url, headers=headers, data=payload)
            data = response.json()
            if 'organic' in data:
                import re
                for item in data['organic']:
                    snippet = item.get('snippet', '').lower()
                    emails = re.findall(r'[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+', snippet)
                    if emails:
                        contacts.append({
                            "name": "Decision Maker",
                            "role": "Executive",
                            "email": emails[0]
                        })
                        break
        except:
            pass
            
    if not contacts:
        contacts.append({
            "name": "Contact",
            "role": "General Inquiry",
            "email": f"contact@{domain}"
        })
        
    return contacts

@app.post("/get-contacts")
async def get_contacts(request: GetContactsRequest):
    try:
        contacts = get_multiple_leads(request.company)
        return {"contacts": contacts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get contacts: {str(e)}")


class GenerateEmailRequest(BaseModel):
    company: str
    icp: str
    contact_name: str
    contact_email: str

def generate_email_draft(company: str, icp: str, contact_name: str, signals: list) -> str:
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage, SystemMessage
    
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in configuration")
        
    chat = ChatGroq(temperature=0.4, groq_api_key=api_key, model_name="llama-3.1-8b-instant")
    messages = [
        SystemMessage(content="You are an expert sales SDR. Generate a hyper-personalized outreach email referencing the provided signals. You must explicitly reference signals, never use templates, and the tone must feel human and natural. Only output the exact email content including Subject.\n\nCRITICAL: Never use square brackets or placeholders. Write this for a real person at the Target Company. At the end of the email, always sign off exactly as:\n\nBest,\nFireReach Agent"),
        HumanMessage(content=f"Target Company Name: {company}\nTarget Contact Name: {contact_name}\nSignals: {signals}\nICP: {icp}\n\nWrite the email now.")
    ]
    
    email_content = chat.invoke(messages).content
    return email_content

@app.post("/generate-email")
async def generate_email(request: GenerateEmailRequest):
    try:
        signals_str = tool_signal_harvester.invoke({"company": request.company})
        signals_list = json.loads(signals_str) if isinstance(signals_str, str) and "[" in signals_str else [signals_str]
        body = generate_email_draft(request.company, request.icp, request.contact_name, signals_list)
        
        subject = f"Outreach for {request.company}"
        if "Subject:" in body:
            lines = body.split('\n')
            for line in lines:
                if line.startswith("Subject:"):
                    subject = line.replace("Subject:", "").strip()
                    break
                    
        return {"email": body, "subject": subject, "signals": signals_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate email: {str(e)}")


class SendEmailRequest(BaseModel):
    to_email: str
    subject: str
    body: str

@app.post("/send-email")
async def send_email_endpoint(request: SendEmailRequest):
    try:
        result = send_email(request.to_email, request.subject, request.body)
        if result.get("status") == "error":
            raise Exception(result.get("message"))
        return {"status": "sent", "message": f"Successfully sent to {request.to_email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@app.post("/manual-email")
async def manual_email(request: ManualEmailRequest):
    try:
        company = request.company
        if not company:
            # Infer company from email domain
            domain = request.email.split('@')[-1]
            company = domain.split('.')[0].capitalize()
        
        icp = request.icp if request.icp else "General B2B Outreach"
        
        # Try to get signals
        try:
            signals_str = tool_signal_harvester.invoke({"company": company})
            signals_list = json.loads(signals_str) if isinstance(signals_str, str) and "[" in signals_str else [signals_str]
        except:
            signals_list = ["Professional outreach based on company profile"]

        # Generate draft
        body = generate_email_draft(company, icp, "there", signals_list)
        
        subject = f"Outreach for {company}"
        if "Subject:" in body:
            lines = body.split('\n')
            for line in lines:
                if line.startswith("Subject:"):
                    subject = line.replace("Subject:", "").strip()
                    break
                    
        return {
            "email": body, 
            "subject": subject, 
            "company": company,
            "signals": signals_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate manual email: {str(e)}")

@app.post("/send-manual-email")
async def send_manual_email(request: SendManualEmailRequest):
    try:
        result = send_email(request.email, request.subject, request.body)
        if result.get("status") == "error":
            raise Exception(result.get("message"))
        return {"status": "sent", "message": f"Successfully sent to {request.email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send manual email: {str(e)}")
