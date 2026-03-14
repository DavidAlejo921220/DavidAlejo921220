import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin } from 'lucide-react';

// Iconos personalizados
const truckIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7200c4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const pickupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="#00e0ff" stroke="#000" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3" fill="#000"/>
    </svg>
  `),
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="#10b981" stroke="#000" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3" fill="#000"/>
    </svg>
  `),
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

export default function TrackingMap({ service, driverLocation }) {
  const [center, setCenter] = useState([4.7110, -74.0721]);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    if (service?.pickup_location) {
      setCenter([service.pickup_location.lat, service.pickup_location.lng]);
    }
  }, [service]);

  useEffect(() => {
    // Crear ruta entre grúa y destino
    if (driverLocation && service?.destination_location) {
      setRoute([
        [driverLocation.lat, driverLocation.lng],
        [service.destination_location.lat, service.destination_location.lng]
      ]);
    }
  }, [driverLocation, service]);

  if (!service) return null;

  return (
    <div className="h-[400px] rounded-lg overflow-hidden border border-white/10" data-testid="tracking-map">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        {/* Ubicación de recogida */}
        {service.pickup_location && (
          <Marker 
            position={[service.pickup_location.lat, service.pickup_location.lng]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Punto de Recogida</strong>
                <br />
                {service.pickup_address || 'Ubicación marcada en mapa'}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Ubicación de destino */}
        {service.destination_location && (
          <Marker 
            position={[service.destination_location.lat, service.destination_location.lng]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Destino</strong>
                <br />
                {service.destination_address || 'Ubicación marcada en mapa'}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Ubicación actual del conductor */}
        {driverLocation && (
          <Marker 
            position={[driverLocation.lat, driverLocation.lng]}
            icon={truckIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-[#7200c4]">Grúa en Camino</strong>
                <br />
                Ubicación en tiempo real
              </div>
            </Popup>
          </Marker>
        )}

        {/* Línea de ruta */}
        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="#7200c4" 
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}