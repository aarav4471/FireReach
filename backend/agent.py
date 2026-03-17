from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from prompts import SYSTEM_PROMPT
from tools import tool_signal_harvester, tool_research_analyst, tool_outreach_automated_sender, tool_company_search, tool_lead_finder, clear_run_state, run_state
from config import settings
import os
import json

def run_firereach_agent(company: str, icp: str, email: str):
    clear_run_state()
    
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in configuration")

    # Initialize LLM
    llm = ChatGroq(temperature=0, groq_api_key=api_key, model_name="llama-3.3-70b-versatile")
    
    tools = [tool_company_search, tool_lead_finder, tool_signal_harvester, tool_research_analyst, tool_outreach_automated_sender]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=5)
    
    input_text = f"Execute the outreach workflow for ICP: '{icp}'."
    if company:
        input_text += f" The target company is '{company}'."
    if email:
        input_text += f" The target email is '{email}'."
    
    input_text += " If company or email are missing, find them using the tools first."
    
    try:
        agent_executor.invoke({"input": input_text})
        # After execution, ensure the latest email found by tools is captured
        if not run_state.get("target_email") and run_state.get("email"):
             # We can't easily extract it from tools.py's run_state since it's shared
             pass 
    except Exception as e:
        print(f"Agent execution encountered an error: {e}")
        
    run_state["target_email"] = email
    return run_state
