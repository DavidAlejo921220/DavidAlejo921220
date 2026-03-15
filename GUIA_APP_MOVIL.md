# 📱 GruaApp - Aplicación Móvil Android

## Guía para Crear la App Móvil Android

Esta guía te ayudará a crear una aplicación móvil nativa de Android para GruaApp usando React Native.

---

## 🎯 Opciones para Crear la App Móvil

### Opción 1: React Native (Recomendada)
**Ventajas:**
- ✅ Reutiliza todo el código de React
- ✅ Una sola base de código para iOS y Android
- ✅ Desarrollo rápido
- ✅ Comunidad grande

**Tiempo estimado:** 2-3 semanas

### Opción 2: Flutter
**Ventajas:**
- ✅ Performance nativo
- ✅ UI hermosa por defecto
- ✅ iOS + Android

**Desventaja:**
- ❌ Requiere reescribir todo en Dart

**Tiempo estimado:** 4-6 semanas

### Opción 3: Kotlin Nativo (Solo Android)
**Ventajas:**
- ✅ Performance máximo
- ✅ Acceso completo a APIs Android

**Desventaja:**
- ❌ Solo Android
- ❌ Desarrollo más lento

**Tiempo estimado:** 6-8 semanas

---

## 🚀 Implementación con React Native (Paso a Paso)

### Paso 1: Instalar Herramientas

```bash
# Instalar Node.js (si no lo tienes)
# https://nodejs.org/

# Instalar React Native CLI
npm install -g react-native-cli

# Instalar Android Studio
# https://developer.android.com/studio
```

### Paso 2: Crear Proyecto React Native

```bash
npx react-native init GruaAppMobile
cd GruaAppMobile
```

### Paso 3: Instalar Dependencias Necesarias

```bash
# Navegación
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Mapas
npm install react-native-maps

# HTTP
npm install axios

# WebSockets
npm install socket.io-client

# Geolocalización
npm install react-native-geolocation-service

# Permisos
npm install react-native-permissions

# AsyncStorage (como localStorage)
npm install @react-native-async-storage/async-storage

# UI Components
npm install react-native-paper react-native-vector-icons
```

### Paso 4: Configurar Permisos en Android

Edita `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <!-- Permisos necesarios -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application>
        <!-- Configuración de Google Maps -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="TU_API_KEY_DE_GOOGLE_MAPS"/>
    </application>
</manifest>
```

### Paso 5: Estructura de Carpetas

```
GruaAppMobile/
├── src/
│   ├── api/
│   │   ├── client.js           # Configuración Axios
│   │   └── endpoints.js        # Endpoints del API
│   ├── components/
│   │   ├── MapView.js          # Componente de mapa
│   │   ├── OfferCard.js        # Tarjeta de oferta
│   │   └── ChatMessage.js      # Mensaje de chat
│   ├── screens/
│   │   ├── client/
│   │   │   ├── HomeScreen.js
│   │   │   ├── CreateServiceScreen.js
│   │   │   ├── MyServicesScreen.js
│   │   │   └── ChatScreen.js
│   │   ├── driver/
│   │   │   ├── HomeScreen.js
│   │   │   ├── AvailableServicesScreen.js
│   │   │   └── MyServicesScreen.js
│   │   └── auth/
│   │       ├── LoginScreen.js
│   │       └── RegisterScreen.js
│   ├── navigation/
│   │   ├── AppNavigator.js     # Navegación principal
│   │   └── AuthNavigator.js    # Navegación de auth
│   ├── contexts/
│   │   ├── AuthContext.js      # Contexto de autenticación
│   │   └── SocketContext.js    # Contexto de WebSocket
│   ├── utils/
│   │   ├── currency.js         # Formato de moneda COP
│   │   └── location.js         # Utilidades de ubicación
│   └── App.js
```

### Paso 6: Ejemplo de Componente Principal (App.js)

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SocketProvider>
    </AuthProvider>
  );
}
```

### Paso 7: API Client (src/api/client.js)

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://driver-client-hub-1.preview.emergentagent.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Paso 8: Screen de Ejemplo - HomeScreen.js (Cliente)

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Button, Card } from 'react-native-paper';
import apiClient from '../../api/client';

export default function HomeScreen({ navigation }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await apiClient.get('/services/my-services');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Servicios</Text>
      
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('CreateService')}
        style={styles.createButton}
      >
        Solicitar Grúa
      </Button>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>
                {item.vehicle_brand} {item.vehicle_model}
              </Text>
              <Text>{item.vehicle_type} - {item.status}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0a1120',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00e0ff',
    marginBottom: 16,
  },
  createButton: {
    marginBottom: 16,
    backgroundColor: '#00e0ff',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#111827',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
```

### Paso 9: Mapa con Geolocalización

```javascript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS } from 'react-native-permissions';

export default function MapScreen() {
  const [region, setRegion] = useState({
    latitude: 4.7110,
    longitude: -74.0721,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (result === 'granted') {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker coordinate={region} title="Tu ubicación" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
```

### Paso 10: Ejecutar la App

```bash
# Iniciar Metro (servidor de desarrollo)
npx react-native start

# En otra terminal, ejecutar en Android
npx react-native run-android

# O en emulador
# 1. Abrir Android Studio
# 2. Tools > AVD Manager > Crear/Iniciar emulador
# 3. npx react-native run-android
```

---

## 📦 Generar APK para Distribución

### APK de Debug (Para Pruebas)

```bash
cd android
./gradlew assembleDebug
# APK generado en: android/app/build/outputs/apk/debug/app-debug.apk
```

### APK de Release (Para Producción)

1. **Generar Keystore:**
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore gruaapp-release.keystore -alias gruaapp -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configurar en android/gradle.properties:**
```properties
GRUAAPP_RELEASE_STORE_FILE=gruaapp-release.keystore
GRUAAPP_RELEASE_KEY_ALIAS=gruaapp
GRUAAPP_RELEASE_STORE_PASSWORD=tu_password
GRUAAPP_RELEASE_KEY_PASSWORD=tu_password
```

3. **Editar android/app/build.gradle:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file(GRUAAPP_RELEASE_STORE_FILE)
            storePassword GRUAAPP_RELEASE_STORE_PASSWORD
            keyAlias GRUAAPP_RELEASE_KEY_ALIAS
            keyPassword GRUAAPP_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

4. **Generar APK:**
```bash
cd android
./gradlew assembleRelease
# APK en: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🏪 Publicar en Google Play Store

### Requisitos:
1. Cuenta de Google Play Developer ($25 USD, pago único)
2. APK firmado (app-release.apk)
3. Iconos de la app (512x512px, 1024x500px)
4. Screenshots (mínimo 2)
5. Descripción de la app
6. Política de privacidad

### Pasos:
1. Ir a [Google Play Console](https://play.google.com/console)
2. Crear nueva aplicación
3. Llenar información (nombre, descripción, categoría)
4. Subir APK o AAB
5. Configurar precios (gratis o pago)
6. Enviar para revisión
7. Esperar aprobación (1-3 días)

---

## 🔧 Herramientas Útiles

### Testing
- **React Native Debugger:** Debugger visual
- **Flipper:** Debugging avanzado
- **Reactotron:** Inspección de estado

### CI/CD
- **Fastlane:** Automatización de builds
- **GitHub Actions:** CI/CD gratuito
- **Bitrise:** Específico para móviles

---

## 💡 Mejoras Adicionales para la App Móvil

1. **Notificaciones Push**
   - Firebase Cloud Messaging
   - Notificar nuevas ofertas, mensajes, actualizaciones

2. **Modo Offline**
   - Guardar datos localmente
   - Sincronizar cuando haya internet

3. **Compartir Ubicación**
   - Enviar ubicación actual por WhatsApp
   - Compartir tracking link

4. **Llamadas Directas**
   - Botón para llamar al conductor
   - Integración con app de teléfono

5. **Pago In-App**
   - Integrar Stripe/PayPal
   - Pago con tarjeta dentro de la app

---

## 📞 Soporte

¿Necesitas ayuda con la app móvil?
- **Email**: soporte@gruaapp.com
- **WhatsApp**: +57 XXX XXX XXXX

---

## 🎯 Alternativa Rápida: PWA (Progressive Web App)

Si necesitas algo **MÁS RÁPIDO** que una app nativa:

### Ventajas de PWA:
- ✅ Funciona en Android e iOS
- ✅ Se instala desde el navegador
- ✅ Notificaciones push
- ✅ Funciona offline
- ✅ No requiere Play Store
- ✅ **Tu app actual YA es compatible**

### Cómo Habilitar PWA:

1. **Agregar manifest.json en /frontend/public:**
```json
{
  "name": "GruaApp",
  "short_name": "GruaApp",
  "description": "Tu grúa en minutos - Colombia",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a1120",
  "theme_color": "#00e0ff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Crear Service Worker** (ya incluido en Create React App)

3. **Usuarios pueden "Agregar a inicio"** desde Chrome/Safari

---

## ✅ Recomendación Final

**Para MVP rápido:** Usa tu app web actual como PWA
**Para app profesional:** Desarrolla con React Native
**Para máximo performance:** Kotlin nativo

**Tiempo de desarrollo:**
- PWA: 1 día ✅ (YA ESTÁ LISTA)
- React Native: 2-3 semanas
- Kotlin nativo: 6-8 semanas

---

¿Quieres que te ayude a implementar alguna de estas opciones?
