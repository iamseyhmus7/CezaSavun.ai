import structlog
from email.message import EmailMessage
import aiosmtplib
from app.config import settings

logger = structlog.get_logger()

def get_html_template(title, content, button_text=None, button_url=None, otp_code=None):
    """
    Profesyonel CezaSavun.ai HTML e-posta şablonu.
    """
    otp_section = ""
    if otp_code:
        otp_section = f"""
        <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 40px; background-color: #f0f7ff; border: 2px dashed #0066ff; border-radius: 12px;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0066ff; font-family: 'Inter', sans-serif;">{otp_code}</span>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 10px; font-weight: 500;">Kod 5 dakika boyunca geçerlidir.</p>
        </div>
        """

    button_section = ""
    if button_text and button_url:
        button_section = f"""
        <div style="text-align: center; margin: 30px 0;">
            <a href="{button_url}" style="display: inline-block; padding: 14px 30px; background-color: #0066ff; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.2);">
                {button_text}
            </a>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
            .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; text-align: center; }}
            .content {{ padding: 40px; color: #1e293b; line-height: 1.6; }}
            .footer {{ background-color: #f1f5f9; padding: 30px; text-align: center; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; }}
            .logo {{ font-size: 24px; font-weight: 800; color: #ffffff; text-decoration: none; }}
            .accent {{ color: #0066ff; }}
            h1 {{ font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; }}
            p {{ font-size: 15px; color: #475569; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <a href="https://cezasavun.ai" class="logo">CezaSavun<span class="accent">.ai</span></a>
            </div>
            <div class="content">
                <h1>{title}</h1>
                <p>{content}</p>
                {otp_section}
                {button_section}
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="font-size: 13px; color: #94a3b8;">Bu e-posta <b>CezaSavun.ai</b> güvenlik sistemi tarafından otomatik olarak gönderilmiştir. Bir hata olduğunu düşünüyorsanız lütfen bizimle iletişime geçin.</p>
            </div>
            <div class="footer">
                <div style="font-size: 12px; color: #64748b; font-weight: 600;">© 2026 CezaSavun.ai · Trafik İtiraz Yapay Zeka Ajanı</div>
                <div style="margin-top: 15px; font-size: 11px; color: #94a3b8;">
                    Güvenli İşlem Merkezi · SSL Sertifikalı Altyapı
                </div>
            </div>
        </div>
    </body>
    </html>
    """

async def send_otp_email(email: str, otp: str):
    message = EmailMessage()
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"] = email
    message["Subject"] = f"🔑 Doğrulama Kodunuz: {otp} | CezaSavun.ai"

    text_content = f"CezaSavun.ai doğrulama kodunuz: {otp}. Bu kod 5 dakika geçerlidir."
    html_content = get_html_template(
        title="Giriş Doğrulaması",
        content="Hesabınıza güvenli bir şekilde erişmek için aşağıdaki tek kullanımlık doğrulama kodunu kullanın. Güvenliğiniz için bu kodu kimseyle paylaşmayın.",
        otp_code=otp
    )

    message.set_content(text_content)
    message.add_alternative(html_content, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info("email_sent", type="otp", to=email)
    except Exception as e:
        logger.error("email_failed", type="otp", to=email, error=str(e))
        print(f"[ERROR] Email sending failed: {e}")

async def send_reset_password_email(email: str, token: str):
    # Frontend portu 8000 ve rota /auth/reset-password olduğu için güncelledik
    reset_link = f"http://localhost:8000/auth/reset-password?token={token}"
    message = EmailMessage()
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"] = email
    message["Subject"] = "🔐 Şifre Sıfırlama Talebi | CezaSavun.ai"

    text_content = f"Şifrenizi sıfırlamak için şu bağlantıya tıklayın: {reset_link}"
    html_content = get_html_template(
        title="Şifre Sıfırlama",
        content="Hesabınız için şifre sıfırlama talebi aldık. Eğer bu işlemi siz yaptıysanız aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.",
        button_text="Şifremi Sıfırla",
        button_url=reset_link
    )

    message.set_content(text_content)
    message.add_alternative(html_content, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info("email_sent", type="password_reset", to=email)
    except Exception as e:
        logger.error("email_failed", type="password_reset", to=email, error=str(e))
        print(f"[ERROR] Email sending failed: {e}")

