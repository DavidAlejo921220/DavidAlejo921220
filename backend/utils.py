import random
import logging
import asyncio
import resend
import os

logger = logging.getLogger(__name__)

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

async def send_otp_email(email: str, otp_code: str):
    """Envía OTP por email usando Resend"""
    resend.api_key = os.environ.get('RESEND_API_KEY')
    sender_email = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
    
    # Si no hay API key, solo loguear (modo desarrollo)
    if not resend.api_key or resend.api_key == 'your_resend_api_key_here':
        logger.info(f"Enviando OTP {otp_code} a {email}")
        print(f"\n{'='*50}")
        print(f"OTP para {email}: {otp_code}")
        print(f"{'='*50}\n")
        return True
    
    # Enviar email real
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #0a1120; color: #ffffff; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 12px; padding: 40px; }}
            .logo {{ text-align: center; margin-bottom: 30px; }}
            h1 {{ color: #00e0ff; font-size: 32px; margin-bottom: 10px; }}
            .otp-code {{ background-color: #00e0ff; color: #000000; font-size: 36px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0; letter-spacing: 8px; }}
            p {{ color: #94a3b8; line-height: 1.6; }}
            .footer {{ text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <h1>GruaApp</h1>
            </div>
            <p>Hola,</p>
            <p>Has solicitado un código de verificación para tu cuenta en GruaApp. Usa el siguiente código:</p>
            <div class="otp-code">{otp_code}</div>
            <p>Este código es válido por 10 minutos.</p>
            <p>Si no solicitaste este código, por favor ignora este mensaje.</p>
            <div class="footer">
                <p>GruaApp - Tu Grúa en Minutos 🚛</p>
                <p>Colombia</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": sender_email,
        "to": [email],
        "subject": f"Tu código de verificación GruaApp: {otp_code}",
        "html": html_content
    }
    
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email enviado exitosamente a {email}")
        return True
    except Exception as e:
        logger.error(f"Error enviando email: {str(e)}")
        # Fallback a consola si falla el email
        print(f"\n{'='*50}")
        print(f"OTP para {email}: {otp_code}")
        print(f"Error: {str(e)}")
        print(f"{'='*50}\n")
        return True

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula distancia en km usando fórmula de Haversine"""
    from math import radians, cos, sin, asin, sqrt
    
    # Radio de la Tierra en km
    R = 6371
    
    # Convertir a radianes
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Fórmula de Haversine
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    return R * c