from langchain.tools import tool
import os
import requests
import json
from email_service import send_email
from config import settings

run_state = {
    "signals": [],
    "research": "",
    "email": "",
    "target_person": "",
    "target_company": "",
    "email_sent": False  # Safeguard flag
}

def clear_run_state():
    run_state["signals"] = []
    run_state["research"] = ""
    run_state["email"] = ""
    run_state["target_person"] = ""
    run_state["target_company"] = ""
    run_state["email_sent"] = False

@tool
def tool_company_search(icp: str) -> str:
    """
    Find companies that match the Ideal Customer Profile (ICP).
    Returns a list of potential target companies.
    """
    serper_api_key = settings.SERPER_API_KEY
    if not serper_api_key:
        raise ValueError("SERPER_API_KEY not found in configuration")

    url = "https://google.serper.dev/search"
    payload = json.dumps({
      "q": f"companies matching ICP: {icp}"
    })
    headers = {
      'X-API-KEY': serper_api_key,
      'Content-Type': 'application/json'
    }
    
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        data = response.json()
        companies = []
        if 'organic' in data:
            for item in data['organic']:
                title = item.get('title', '')
                
                # Strict noise filtering for generic titles
                noise_words = ["top", "best", "list", "how to", "guide", "profile", "rank", "2024", "2025", "2026", "startups in", "companies in"]
                if any(word in title.lower() for word in noise_words) and len(title.split()) > 5:
                    continue
                
                # Extract potential company name
                company_name = title.split('|')[0].split('-')[0].split(':')[0].strip()
                
                # Final check: skip if it looks like a generic category description
                if len(company_name.split()) > 4 or "funded by" in company_name.lower():
                    continue

                if company_name and company_name not in companies:
                    companies.append(company_name)
        
        # Fallback: if all were filtered, take the first one despite noise but clean it more
        if not companies and 'organic' in data and data['organic']:
             title = data['organic'][0].get('title', '')
             company_name = title.split('|')[0].split('-')[0].split(':')[0].strip()
             companies.append(company_name)

        if not companies:
            return "No companies found for this ICP."
        
        # Set the first company found as the default target in state if none set
        if not run_state.get("target_company"):
             run_state["target_company"] = companies[0]
            
        return json.dumps(companies[:5])
    except Exception as e:
        return f"Error searching for companies: {str(e)}"

@tool
def tool_lead_finder(company: str) -> str:
    """
    Find a key decision maker (e.g., CEO, CTO, Head of Sales) and their email for a specific company using Hunter.io.
    Returns the person's name and email address.
    """
    serper_api_key = settings.SERPER_API_KEY
    hunter_api_key = settings.HUNTER_API_KEY

    if not serper_api_key:
        raise ValueError("SERPER_API_KEY not found in configuration")
    
    # 1. First, find the company domain using Serper if it's not already a domain
    domain = company.lower().replace(" ", "").replace(".com", "").replace(".io", "").replace(".co", "")
    if "." not in company:
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
        except Exception as e:
            print(f"Error finding domain: {e}")

    # 2. Use Hunter.io to find leads if API key is provided
    if hunter_api_key:
        url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={hunter_api_key}"
        try:
            response = requests.get(url)
            data = response.json()
            if 'data' in data and data['data'].get('emails'):
                # Pick the first email with a name if possible
                best_email = None
                for email_data in data['data']['emails']:
                    if email_data.get('first_name'):
                        best_email = email_data
                        break
                
                if not best_email:
                    best_email = data['data']['emails'][0]
                
                first_name = best_email.get('first_name', 'Decision')
                last_name = best_email.get('last_name', 'Maker')
                found_person = f"{first_name} {last_name}".strip()
                found_email = best_email.get('value')
                
                res = {"name": found_person, "email": found_email, "company": company, "domain": domain}
                run_state["target_person"] = found_person
                run_state["target_company"] = company
                return json.dumps(res)
        except Exception as e:
            print(f"Hunter.io error: {e}")

    # 3. Fallback to basic discovery if Hunter.io fails or no key
    url = "https://google.serper.dev/search"
    query = f"{company} {domain} CEO CTO Head of Engineering email"
    payload = json.dumps({"q": query})
    headers = {'X-API-KEY': serper_api_key, 'Content-Type': 'application/json'}
    
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        data = response.json()
        found_email = ""
        found_person = "Decision Maker"
        
        if 'organic' in data:
            import re
            for item in data['organic']:
                snippet = item.get('snippet', '').lower()
                emails = re.findall(r'[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+', snippet)
                if emails:
                    found_email = emails[0]
                    break
        
        if not found_email:
            found_email = f"contact@{domain}"
        
        res = {"name": found_person, "email": found_email, "company": company, "domain": domain}
        run_state["target_person"] = found_person
        run_state["target_company"] = company
        return json.dumps(res)
    except Exception as e:
        return f"Error finding lead: {str(e)}"

@tool
def tool_signal_harvester(company: str) -> str:
    """
    Fetch live buyer signals about a company.
    Signals to capture: funding rounds, leadership changes, hiring trends, tech stack changes, social mentions, product launches, competitor churn.
    """
    serper_api_key = settings.SERPER_API_KEY
    if not serper_api_key:
        raise ValueError("SERPER_API_KEY not found in configuration")

    url = "https://google.serper.dev/search"
    payload = json.dumps({
      "q": f"{company} funding OR hiring OR leadership OR product launch OR tech stack news"
    })
    headers = {
      'X-API-KEY': serper_api_key,
      'Content-Type': 'application/json'
    }
    
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        data = response.json()
        
        signals = []
        if 'organic' in data:
            for item in data['organic'][:3]: # Get top 3 news/signals
                signals.append(item.get('title', '') + " - " + item.get('snippet', ''))
        
        if not signals:
            signals = [f"No recent signals found for {company}"]
            
        run_state["signals"] = signals
        return json.dumps(signals)
    except Exception as e:
        error_msg = [f"Error fetching signals: {str(e)}"]
        run_state["signals"] = error_msg
        return json.dumps(error_msg)


@tool
def tool_research_analyst(signals: str, icp: str) -> str:
    """
    Analyze signals and ICP to generate a 2 paragraph account brief.
    """
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage, SystemMessage
    
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in configuration")
        
    try:
        chat = ChatGroq(temperature=0.2, groq_api_key=api_key, model_name="llama-3.1-8b-instant")
        messages = [
            SystemMessage(content="You are a research analyst. Analyze the given signals and Ideal Customer Profile (ICP) to generate a 2 paragraph account brief. Include company growth context, potential pain points, and strategic alignment with ICP. Do not output anything else."),
            HumanMessage(content=f"Signals: {signals}\n\nICP: {icp}")
        ]
        response = chat.invoke(messages)
        research = response.content
        run_state["research"] = research
        return research
    except Exception as e:
        error_research = f"Failed to generate research: {str(e)}"
        run_state["research"] = error_research
        return error_research


@tool
def tool_outreach_automated_sender(signals: str, icp: str, company: str, email_address: str) -> str:
    """
    Generate a hyper-personalized outreach email referencing the signals and automatically send the email.
    """
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage, SystemMessage
    
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in configuration")
        
    if run_state.get("email_sent"):
        print(f"DEBUG: Safeguard triggered. Email already sent in this run to {email_address}. Skipping.")
        return f"Email was already successfully sent to {email_address}. Done."

    try:
        chat = ChatGroq(temperature=0.4, groq_api_key=api_key, model_name="llama-3.1-8b-instant")
        messages = [
            SystemMessage(content="You are an expert sales SDR. Generate a hyper-personalized outreach email referencing the provided signals. You must explicitly reference signals, never use templates, and the tone must feel human and natural. Only output the exact email content including Subject.\n\nCRITICAL: Never use square brackets or placeholders like [Company Name], [Decision Maker], or [Your Name]. You are writing this for a real person at the Target Company. If you don't know a name, use 'Hi,'. At the end of the email, always sign off exactly as:\n\nBest,\nFireReach Agent"),
            HumanMessage(content=f"Target Company Name: {company}\nSignals: {signals}\nICP: {icp}\n\nWrite the email now.")
        ]
        
        email_content = chat.invoke(messages).content
        run_state["email"] = email_content
        
        # Parse subject if possible, or use a default
        subject = f"Outreach for {company}"
        if "Subject:" in email_content:
            lines = email_content.split('\n')
            for line in lines:
                if line.startswith("Subject:"):
                    subject = line.replace("Subject:", "").strip()
                    break
                    
        print(f"DEBUG: Attempting to send email to {email_address} with subject: {subject}")
        email_res = send_email(email_address, subject, email_content)
        print(f"DEBUG: send_email response: {email_res}")
        
        if email_res.get("status") == "error":
            return f"The email was drafted but FAILED to send. Error: {email_res.get('message')}"
            
        run_state["email_sent"] = True
        print(f"DEBUG: Drafted and sent email successfully to {email_address}")
        return f"Drafted and sent email successfully to {email_address}. You have completed the workflow. STOP NOW."
    except Exception as e:
        error_msg = f"Failed to generate and send email: {str(e)}"
        run_state["email"] = error_msg
        return error_msg
