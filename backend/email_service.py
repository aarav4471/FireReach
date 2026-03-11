from config import settings
import resend
import os

def send_email(to_email: str, subject: str, body: str):
    resend.api_key = settings.RESEND_API_KEY
    if not resend.api_key:
        print("MOCK SEND EMAIL:", to_email)
        print("SUBJECT:", subject)
        print("BODY:", body)
        return {"status": "mocked"}
        
    try:
        params = {
            "from": "FireReach Agent <onboarding@resend.dev>",
            "to": to_email,
            "subject": subject,
            "html": f"<div style='white-space: pre-wrap;'>{body}</div>"
        }
        r = resend.Emails.send(params)
        print("RESEND API RESPONSE:", r)
        return {"status": "sent", "resend_id": getattr(r, "id", None)}
    except Exception as e:
        error_msg = str(e)
        print("CRITICAL: Failed to send email via Resend:", error_msg)
        return {"status": "error", "message": error_msg}
