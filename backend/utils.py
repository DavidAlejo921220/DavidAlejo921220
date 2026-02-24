import random
import logging

logger = logging.getLogger(__name__)

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

async def send_otp_email(email: str, otp_code: str):
    logger.info(f"Enviando OTP {otp_code} a {email}")
    print(f"\n{'='*50}")
    print(f"OTP para {email}: {otp_code}")
    print(f"{'='*50}\n")
    return True