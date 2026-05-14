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
    sender_email = os.environ.get('SENDER_EMAIL', 'notificaciones@gruaapp.com')
    
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
    sender_email = os.environ.get('SENDER_EMAIL', 'notificaciones@gruaapp.com')
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


# ============ NOTIFICACIONES POR EMAIL ============

async def send_notification_email(to_email: str, subject: str, title: str, message: str, action_url: str = None, action_text: str = "Ver en GruaApp"):
    """Envía email de notificación usando Resend"""
    resend.api_key = os.environ.get('RESEND_API_KEY')
    sender_email = os.environ.get('SENDER_EMAIL', 'notificaciones@gruaapp.com')
    app_url = "https://gruaapp.com"
    
    print(f"[EMAIL DEBUG] API Key: {resend.api_key[:10]}... | From: {sender_email} | To: {to_email}")
    
    if not resend.api_key or resend.api_key == 'your_resend_api_key_here':
        logger.info(f"[EMAIL] {subject} -> {to_email}: {message}")
        return True
    
    action_button = ""
    if action_url:
        action_button = f'''
        <a href="{action_url}" style="display: inline-block; background-color: #00e0ff; color: #000000; font-weight: bold; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px;">{action_text}</a>
        '''
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #0a1120; color: #ffffff; padding: 20px; margin: 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 12px; padding: 40px; }}
            h1 {{ color: #00e0ff; font-size: 24px; margin-bottom: 10px; }}
            .message {{ background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00e0ff; }}
            p {{ color: #94a3b8; line-height: 1.6; margin: 10px 0; }}
            .footer {{ text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚛 {title}</h1>
            <div class="message">
                <p style="color: #ffffff; font-size: 16px;">{message}</p>
            </div>
            <div style="text-align: center;">
                {action_button}
            </div>
            <div class="footer">
                <p>GruaApp - Tu servicio de grúas en Colombia</p>
                <p><a href="{app_url}" style="color: #00e0ff;">gruaapp.com</a></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        from_address = f"GruaApp <{sender_email}>"
        params = {
            "from": from_address,
            "to": [to_email],
            "subject": f"🚛 {subject}",
            "html": html_content
        }
        print(f"[EMAIL DEBUG] Enviando con from='{from_address}' to='{to_email}'")
        result = await asyncio.to_thread(resend.Emails.send, params)
        print(f"[EMAIL DEBUG] Resultado: {result}")
        logger.info(f"Email enviado a {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL DEBUG] ERROR: {e}")
        logger.error(f"Error enviando email: {e}")
        return False


async def notify_client_new_offer(client_email: str, driver_name: str, price: float, service_id: str):
    """Notifica al cliente que recibió una nueva oferta"""
    await send_notification_email(
        to_email=client_email,
        subject="Nueva oferta para tu servicio",
        title="¡Tienes una nueva oferta!",
        message=f"El conductor {driver_name} te ha enviado una oferta de ${price:,.0f} COP para tu servicio de grúa.",
        action_url=f"https://driver-client-hub-1.preview.emergentagent.com/client/services/{service_id}/offers",
        action_text="Ver Oferta"
    )


async def notify_client_status_change(client_email: str, status: str, driver_name: str = None):
    """Notifica al cliente cambios en el estado del servicio"""
    status_messages = {
        "accepted": ("¡Tu servicio fue aceptado!", f"El conductor {driver_name or 'asignado'} está en camino para recoger tu vehículo."),
        "in_progress": ("Conductor en camino", f"{driver_name or 'El conductor'} va en camino a la ubicación de recogida."),
        "picked_up": ("¡Vehículo recogido!", "Tu vehículo ha sido recogido y está siendo transportado al destino."),
        "completed": ("¡Servicio completado!", "Tu servicio de grúa ha sido completado exitosamente. ¡Gracias por usar GruaApp!"),
        "cancelled": ("Servicio cancelado", "Tu servicio ha sido cancelado.")
    }
    
    title, message = status_messages.get(status, ("Actualización de servicio", f"El estado de tu servicio cambió a: {status}"))
    
    await send_notification_email(
        to_email=client_email,
        subject=title,
        title=title,
        message=message,
        action_url="https://driver-client-hub-1.preview.emergentagent.com/client/dashboard",
        action_text="Ver mi servicio"
    )


async def notify_driver_new_service(driver_email: str, vehicle_type: str, pickup_address: str):
    """Notifica al conductor que hay un nuevo servicio disponible"""
    await send_notification_email(
        to_email=driver_email,
        subject="Nuevo servicio disponible",
        title="¡Hay un nuevo servicio cerca!",
        message=f"Un cliente necesita grúa para un {vehicle_type}. Ubicación: {pickup_address}",
        action_url="https://driver-client-hub-1.preview.emergentagent.com/driver/available",
        action_text="Ver Servicio"
    )


async def notify_driver_offer_accepted(driver_email: str, price: float, pickup_address: str):
    """Notifica al conductor que su oferta fue aceptada"""
    await send_notification_email(
        to_email=driver_email,
        subject="¡Tu oferta fue aceptada!",
        title="¡Felicidades! Tu oferta fue aceptada",
        message=f"El cliente aceptó tu oferta de ${price:,.0f} COP. Dirígete a: {pickup_address}",
        action_url="https://driver-client-hub-1.preview.emergentagent.com/driver/services",
        action_text="Ver Servicio"
    )