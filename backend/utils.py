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

async def send_driver_documents_email(driver_data: dict, user_data: dict):
    """Envía los documentos del conductor al admin por email usando Resend"""
    resend.api_key = os.environ.get('RESEND_API_KEY')
    sender_email = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
    admin_email = "gruaap3@gmail.com"
    
    # Si no hay API key, solo loguear
    if not resend.api_key or resend.api_key == 'your_resend_api_key_here':
        logger.info(f"Documentos de conductor {user_data.get('full_name')} - {driver_data.get('vehicle_plate')}")
        print(f"\n{'='*50}")
        print(f"NUEVO CONDUCTOR - Documentos para aprobar")
        print(f"Nombre: {user_data.get('full_name')}")
        print(f"Email: {user_data.get('email')}")
        print(f"Teléfono: {user_data.get('phone')}")
        print(f"Placa: {driver_data.get('vehicle_plate')}")
        print(f"{'='*50}\n")
        return True
    
    # Construir lista de documentos con imágenes
    docs_html = ""
    
    if driver_data.get('vehicle_photo_url'):
        docs_html += f'''
        <div style="margin-bottom: 20px;">
            <h3 style="color: #00e0ff;">Foto de la Grúa con Placa</h3>
            <img src="{driver_data['vehicle_photo_url']}" style="max-width: 100%; max-height: 300px; border-radius: 8px;" />
        </div>
        '''
    
    if driver_data.get('vehicle_registration_photo_url'):
        docs_html += f'''
        <div style="margin-bottom: 20px;">
            <h3 style="color: #7200c4;">Tarjeta de Propiedad</h3>
            <img src="{driver_data['vehicle_registration_photo_url']}" style="max-width: 100%; max-height: 300px; border-radius: 8px;" />
        </div>
        '''
    
    if driver_data.get('cedula_photo_url'):
        docs_html += f'''
        <div style="margin-bottom: 20px;">
            <h3 style="color: #3b82f6;">Cédula del Propietario</h3>
            <img src="{driver_data['cedula_photo_url']}" style="max-width: 100%; max-height: 300px; border-radius: 8px;" />
        </div>
        '''
    
    if driver_data.get('insurance_photo_url'):
        docs_html += f'''
        <div style="margin-bottom: 20px;">
            <h3 style="color: #f97316;">Seguro de Responsabilidad Civil (RCE)</h3>
            <img src="{driver_data['insurance_photo_url']}" style="max-width: 100%; max-height: 300px; border-radius: 8px;" />
        </div>
        '''
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #0a1120; color: #ffffff; padding: 20px; }}
            .container {{ max-width: 800px; margin: 0 auto; background-color: #111827; border-radius: 12px; padding: 40px; }}
            h1 {{ color: #00e0ff; font-size: 28px; margin-bottom: 20px; }}
            h2 {{ color: #ffffff; font-size: 20px; margin-top: 30px; border-bottom: 1px solid #374151; padding-bottom: 10px; }}
            .info-row {{ display: flex; margin-bottom: 10px; }}
            .label {{ color: #94a3b8; width: 150px; }}
            .value {{ color: #ffffff; font-weight: bold; }}
            .docs-section {{ margin-top: 30px; }}
            .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #374151; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚛 Nuevo Conductor - Solicitud de Registro</h1>
            
            <h2>Datos Personales</h2>
            <div class="info-row"><span class="label">Nombre:</span><span class="value">{user_data.get('full_name', 'N/A')}</span></div>
            <div class="info-row"><span class="label">Email:</span><span class="value">{user_data.get('email', 'N/A')}</span></div>
            <div class="info-row"><span class="label">Teléfono:</span><span class="value">{user_data.get('phone', 'N/A')}</span></div>
            
            <h2>Datos del Vehículo</h2>
            <div class="info-row"><span class="label">Placa:</span><span class="value">{driver_data.get('vehicle_plate', 'N/A')}</span></div>
            <div class="info-row"><span class="label">Tipo:</span><span class="value">{driver_data.get('vehicle_type', 'N/A')}</span></div>
            <div class="info-row"><span class="label">Marca:</span><span class="value">{driver_data.get('vehicle_brand', 'N/A')}</span></div>
            <div class="info-row"><span class="label">Modelo:</span><span class="value">{driver_data.get('vehicle_model', 'N/A')}</span></div>
            <div class="info-row"><span class="label">Licencia:</span><span class="value">{driver_data.get('license_number', 'N/A')}</span></div>
            
            <h2>Documentos Adjuntos</h2>
            <div class="docs-section">
                {docs_html}
            </div>
            
            <div class="footer">
                <p>Este conductor está pendiente de aprobación manual.</p>
                <p>Ingresa al panel de admin para aprobar o rechazar.</p>
                <p><strong>GruaApp</strong> - Tu Grúa en Minutos</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": sender_email,
        "to": [admin_email],
        "subject": f"🚛 Nuevo Conductor - {user_data.get('full_name')} - Placa {driver_data.get('vehicle_plate')}",
        "html": html_content
    }
    
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email de documentos enviado a {admin_email}")
        return True
    except Exception as e:
        logger.error(f"Error enviando email de documentos: {str(e)}")
        return False


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