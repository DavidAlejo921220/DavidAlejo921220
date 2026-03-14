import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Icono de grúa personalizado
const truckIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#7200c4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  `),
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

export default function AvailableDriversMap({ center = [4.7110, -74.0721] }) {
  const [drivers, setDrivers] = useState([]);
  const [multipliedDrivers, setMultipliedDrivers] = useState([]);

  useEffect(() => {
    loadAvailableDrivers();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadAvailableDrivers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAvailableDrivers = async () => {
    try {
      const response = await axios.get(`${API}/drivers/available`);
      setDrivers(response.data);
      
      // Multiplicar por 3 cada conductor para efecto visual
      const multiplied = [];
      response.data.forEach((driver, index) => {
        if (driver.current_location) {
          for (let i = 0; i < 3; i++) {
            multiplied.push({
              ...driver,
              uniqueId: `${driver.driver_id}_${i}`,
              offsetLat: driver.current_location.lat + (i - 1) * 0.002,
              offsetLng: driver.current_location.lng + (i - 1) * 0.002
            });
          }
        }
      });
      
      setMultipliedDrivers(multiplied);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  return (
    <div className="h-[400px] rounded-lg overflow-hidden border border-white/10" data-testid="available-drivers-map">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        {multipliedDrivers.map((driver) => (
          <Marker
            key={driver.uniqueId}
            position={[driver.offsetLat, driver.offsetLng]}
            icon={truckIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-[#7200c4]">{driver.full_name}</strong>
                <br />
                <span className="text-xs text-gray-600">
                  {driver.vehicle_brand} {driver.vehicle_model}
                </span>
                <br />
                <span className="text-xs">
                  ⭐ {driver.reputation_score.toFixed(1)}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {drivers.length > 0 && (
        <div className="mt-2 text-center">
          <p className="text-sm text-slate-400">
            🚛 {drivers.length} grúa{drivers.length !== 1 ? 's' : ''} disponible{drivers.length !== 1 ? 's' : ''} cerca de ti
          </p>
        </div>
      )}
    </div>
  );
}