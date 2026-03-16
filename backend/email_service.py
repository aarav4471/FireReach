import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from config import settings

def send_email(to_email: str, subject: str, body: str):
    # Fallback to mock if SMTP credentials are missing
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("MOCK SEND EMAIL (No SMTP credentials):", to_email)
        print("SUBJECT:", subject)
        print("BODY:", body)
        return {"status": "mocked"}
        
    try:
        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = f"FireReach Agent <{settings.SMTP_USERNAME}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        # Attach the HTML body
        html_body = f"<div style='white-space: pre-wrap;'>{body}</div>"
        msg.attach(MIMEText(html_body, 'html'))

        # Connect to the SMTP server and send the email
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"Email sent successfully via SMTP to {to_email}")
        return {"status": "sent"}
        
    except Exception as e:
        error_msg = str(e)
        print("CRITICAL: Failed to send email via SMTP:", error_msg)
        return {"status": "error", "message": error_msg}
