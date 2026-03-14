import cloudinary
import cloudinary.uploader
import os
from fastapi import UploadFile
import base64
from io import BytesIO

# Configurar Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', '')
)

async def upload_image_to_cloudinary(image_data: str, folder: str = "gruaapp") -> str:
    """
    Sube imagen a Cloudinary
    
    Args:
        image_data: Base64 string o URL de la imagen
        folder: Carpeta en Cloudinary
    
    Returns:
        URL pública de la imagen
    """
    try:
        # Si ya es una URL, devolverla
        if image_data.startswith('http'):
            return image_data
        
        # Upload a Cloudinary
        result = cloudinary.uploader.upload(
            image_data,
            folder=folder,
            resource_type="image"
        )
        
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading to Cloudinary: {str(e)}")
        # Fallback: devolver el base64 si falla el upload
        return image_data

async def upload_driver_photos(driver_data: dict) -> dict:
    """Procesa y sube todas las fotos del conductor"""
    
    if driver_data.get('driver_photo_url'):
        driver_data['driver_photo_url'] = await upload_image_to_cloudinary(
            driver_data['driver_photo_url'], 
            'gruaapp/drivers'
        )
    
    if driver_data.get('vehicle_registration_photo_url'):
        driver_data['vehicle_registration_photo_url'] = await upload_image_to_cloudinary(
            driver_data['vehicle_registration_photo_url'], 
            'gruaapp/registrations'
        )
    
    if driver_data.get('vehicle_photo_url'):
        driver_data['vehicle_photo_url'] = await upload_image_to_cloudinary(
            driver_data['vehicle_photo_url'], 
            'gruaapp/vehicles'
        )
    
    return driver_data
