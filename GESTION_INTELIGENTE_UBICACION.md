# Guía: Gestión Inteligente del Permiso de Ubicación

## 🎯 Objetivo

Implementar un sistema de geolocalización que:
- ✅ Solicita permiso UNA SOLA VEZ
- ✅ Respeta la decisión del usuario
- ✅ Evita solicitudes molestas y repetidas
- ✅ Permite cambios manuales desde ajustes
- ✅ Cumple RGPD
- ✅ Funciona en móvil y escritorio

---

## 📊 Estados de Preferencia

El sistema mantiene 3 estados posibles:

### 1. **not_configured** (Por defecto)
- Primera visita del usuario
- Banner visible: **SÍ**
- Comportamiento: Mostrar banner de consentimiento
- Siguiente acción: Usuario presiona "Activar" o "No gracias"

### 2. **accepted** (Usuario aceptó)
- Usuario presionó "Activar ubicación"
- Banner visible: **NO**
- Comportamiento: Cargar ubicación exacta, mostrar cines cercanos
- Cines cercanos: **SÍ** (con dirección, horarios, formatos)
- Streaming: **SÍ** (adaptado a país del usuario)

### 3. **denied** (Usuario rechazó)
- Usuario presionó "No gracias" o rechazó en navegador
- Banner visible: **NO**
- Comportamiento: NO solicitar ubicación, usar IP para país
- Cines cercanos: **NO**
- Streaming: **SÍ** (adaptado a país de IP)

---

## 🔄 Flujo Completo

```
┌─ PRIMERA VISITA (not_configured)
│  │
│  ├─ GeolocationBanner visible
│  │  │
│  │  ├─ Usuario: "Activar ubicación"
│  │  │  └─ requestGeolocation()
│  │  │     ├─ Solicita permiso del navegador
│  │  │     ├─ Si ACEPTA → setLocationPreference("accepted")
│  │  │     │  │ Obtiene coordenadas exactas
│  │  │     │  │ Geocodificación (país/ciudad)
│  │  │     │  │ Caché por 24h
│  │  │     │  └─ Mostrar cines cercanos
│  │  │     │
│  │  │     └─ Si RECHAZA → setLocationPreference("denied")
│  │  │        │ Obtiene país desde IP
│  │  │        └─ NO mostrar cines cercanos
│  │  │
│  │  └─ Usuario: "No gracias"
│  │     └─ rejectGeolocation()
│  │        │ setLocationPreference("denied")
│  │        │ Obtiene país desde IP
│  │        └─ Banner desaparece
│
└─ PRÓXIMAS VISITAS (accepted o denied)
   │
   ├─ GeolocationBanner: OCULTO
   ├─ Verificar preferencia guardada
   ├─ Si accepted → Usar ubicación exacta
   └─ Si denied → Usar IP para país

┌─ USUARIO QUIERE CAMBIAR (desde Ajustes)
│  │
│  └─ resetLocationChoice()
│     │ Borra localStorage
│     │ setLocationPreference("not_configured")
│     └─ Vuelve a mostrar banner en siguiente acción
```

---

## 🧩 Componentes Disponibles

### 1. **GeolocationBanner** (app/layout.jsx)
```jsx
<GeolocationBanner />
```
- Se muestra SOLO la primera vez
- Fijo en parte inferior
- Dos botones: "Activar" y cerrar

### 2. **LocationSettings** (Página de Ajustes)
```jsx
<LocationSettings />
```
- Muestra estado actual
- Botón para cambiar decisión
- Información RGPD
- Enlace a política de privacidad

### 3. **LocationBadge** (Header/Sidebar)
```jsx
<LocationBadge />
```
- Badge pequeño y discreto
- Solo visible si está denegado o no configurado
- Permite cambiar rápidamente

### 4. **LocationStatusCard** (Página de Cartelera)
```jsx
<LocationStatusCard />
```
- Card informativa
- Muestra estado con color
- Botón para cambiar

---

## 🔌 Hook useGeolocation()

```javascript
const {
  location,              // { latitude, longitude, countryCode, countryName, ... }
  loading,               // boolean - Cargando ubicación
  error,                 // string | null - Error si ocurrió
  shouldShowBanner,      // boolean - ¿Mostrar banner? (Solo si not_configured)
  preference,            // "not_configured" | "accepted" | "denied"
  requestGeolocation,    // function() - Solicitar ubicación
  rejectGeolocation,     // function() - Rechazar ubicación
  resetLocationChoice,   // function() - Resetear preferencia (desde ajustes)
  isAllowed,             // boolean - ¿Ubicación permitida?
  isDenied,              // boolean - ¿Ubicación denegada?
} = useGeolocation();
```

---

## 💾 Almacenamiento

### localStorage
```javascript
// Preferencia (única persistencia necesaria)
localStorage.setItem("geolocation_preference", "accepted" | "denied" | "not_configured")

// Datos cacheados (automático)
localStorage.setItem("user_geolocation_data", JSON.stringify({
  latitude,
  longitude,
  accuracy,
  countryCode,
  countryName,
  timestamp
}))
```

### Zustand Store (Opcional)
```javascript
// Ya disponible en movieStore
geolocation: { latitude, longitude, countryCode, ... }
geolocationConsent: boolean
```

---

## 📋 Dónde Mostrar Opciones de Cambio

### 1. ✅ **GeolocationBanner** (Landing)
- Única opción mostrada la primera vez

### 2. ✅ **Página de Usuario/Ajustes**
```jsx
<LocationSettings />
```
- Estado actual
- Botón "Cambiar preferencia"
- Información de RGPD

### 3. ✅ **Header/Navegación** (Discreto)
```jsx
<LocationBadge />
```
- Solo visible si está denegado
- Mini botón para cambiar rápido

### 4. ✅ **Página de Cartelera/Populares**
```jsx
<LocationStatusCard />
```
- Card informativa
- Botón para activar/cambiar

### 5. ✅ **Footer**
- Enlace a "Privacidad y Ubicación"
- Redirecciona a página de ajustes

---

## 🔐 Cumplimiento RGPD

✅ **Consentimiento explícito**
- Usuario debe presionar botón
- No automático

✅ **Sin almacenamiento sin consentimiento**
- Ubicación exacta solo si acepta
- IP siempre disponible (no requiere consentimiento)

✅ **Transparencia**
- Banner explica qué se hace
- Enlace a política de privacidad
- Información clara de RGPD

✅ **Derecho al olvido**
- Botón "resetear" elimina todo
- localStorage limpiado

✅ **Derecho de no ser molestado**
- UNA solicitud al inicio
- Nunca más automática
- Solo si usuario lo pide

---

## 🚀 Implementación en Otras Páginas

### En cualquier página que necesite ubicación:

```jsx
"use client";

import { NearestCinemas } from "@/components/movie/NearestCinemas";
import { StreamingAvailability } from "@/components/movie/StreamingAvailability";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function Page() {
  const { location, isAllowed } = useGeolocation();

  return (
    <div>
      {/* Componentes que usarán ubicación */}
      {isAllowed && location?.latitude && (
        <>
          <NearestCinemas movieId={123} />
          <StreamingAvailability movieId={123} />
        </>
      )}

      {/* Mensaje si está denegado */}
      {isDenied && (
        <p>Activa la ubicación para ver cines cercanos</p>
      )}
    </div>
  );
}
```

---

## 🧪 Testing

### Test Manual

1. **Primera visita**
   - ✅ Banner aparece
   - ✅ "Activar" solicita permisos
   - ✅ "No gracias" cierra banner

2. **Segunda visita**
   - ✅ Banner NO aparece
   - ✅ Ubicación se carga desde caché
   - ✅ Cines cercanos se muestran

3. **Cambiar desde ajustes**
   - ✅ Presionar "Cambiar"
   - ✅ Banner vuelve a aparecer
   - ✅ Ciclo completo nuevamente

4. **Rechazo del navegador**
   - ✅ Si usuario rechaza en navegador
   - ✅ Sistema guarda "denied"
   - ✅ No vuelve a solicitar

---

## 🎨 Estilos y Temas

Los componentes usan Tailwind CSS y se adaptan al estilo actual:

- **GeolocationBanner**: Fijo inferior, blanco/gris
- **LocationSettings**: Panel con borde, icono azul
- **LocationBadge**: Badge azul compacto
- **LocationStatusCard**: Verde (permitido) o rojo (denegado)

---

## 📦 Archivos del Sistema

- ✅ `lib/geolocation.js` - Lógica RGPD y caché
- ✅ `hooks/useGeolocation.js` - Hook React
- ✅ `components/geolocation/GeolocationBanner.jsx` - Banner inicial
- ✅ `components/geolocation/LocationSettings.jsx` - Página de ajustes
- ✅ `components/geolocation/LocationBadge.jsx` - Badge discreto
- ✅ `components/geolocation/LocationStatusCard.jsx` - Card de estado
- ✅ `components/movie/NearestCinemas.jsx` - Cines cercanos
- ✅ `components/movie/StreamingAvailability.jsx` - Streaming
- ✅ `app/layout.jsx` - Banner agregado

---

## 🔄 Ciclo de Vida

```
TIEMPO                    ESTADO              BANNER    CINES    SOLICITUDES
────────────────────────────────────────────────────────────────────────────
Visita 1 (segundo 0)  → not_configured    → VISIBLE  → NO      → 0
Usuario: "Activar"    → loading           → CARGANDO → -       → 1 (navegador)
Respuesta: "Aceptar"  → accepted          → OCULTO   → SÍ      → 0 (rest)
                      → (caché 24h)       
Visita 2 (después)    → accepted          → OCULTO   → SÍ      → 0 (caché)
Ajustes: "Cambiar"    → not_configured    → VISIBLE  → -       → 0 (reset)
Usuario: "No gracias" → denied            → OCULTO   → NO      → 0
Visita 3              → denied            → OCULTO   → NO      → 0 (cached)
```

---

## ✨ Ventajas del Sistema

✅ No molesta al usuario  
✅ Respeta decisiones  
✅ RGPD compliant  
✅ Funciona sin internet completo (caché)  
✅ Performance optimizado  
✅ Escalable (fácil agregar más opciones)  
✅ Mobile-first  
✅ Accesible

---

**¡Sistema implementado y listo! 🎉**
