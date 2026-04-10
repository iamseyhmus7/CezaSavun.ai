import structlog

logger = structlog.get_logger()

async def send_otp_email(email: str, otp: str):
    """
    Simulates sending an OTP email to the user.
    In production, this would use an actual SMTP or email service.
    """
    logger.info("email_sent", type="otp", to=email, code=otp)
    print(f"\n[MOCK EMAIL] To: {email}")
    print(f"[MOCK EMAIL] OTP: {otp}")
    print(f"[MOCK EMAIL] Message: Hesabınızı doğrulamak için yukarıdaki kodu kullanın.\n")

async def send_reset_password_email(email: str, token: str):
    """
    Simulates sending a password reset email to the user.
    """
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    logger.info("email_sent", type="password_reset", to=email)
    print(f"\n[MOCK EMAIL] To: {email}")
    print(f"[MOCK EMAIL] Message: Şifrenizi sıfırlamak için şu linke tıklayın: {reset_link}\n")
