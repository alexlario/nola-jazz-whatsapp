# NOLA Jazz WhatsApp Concierge (Zaragoza → Nueva Orleans, Febrero 2027)

Asistente de WhatsApp con IA diseñado para que tu padre pueda planificar paso a paso, de forma económica y cómoda, su viaje desde **Zaragoza a Nueva Orleans** en **febrero de 2027** con foco en el **mejor jazz tradicional**.

Incluye:
- **Comparador inteligente de fechas (Febrero 2027)**: contrasta la semana del **1–6 de febrero** (recta final pre-Mardi Gras; en 2027 el Martes de Carnaval cae el **9 de febrero**) frente a viajar **a partir del 10–11 de febrero** (donde los hoteles suelen bajar ~30–40% y los clubes de jazz se disfrutan mucho más tranquilos) y una opción híbrida (**30 ene – 5 feb**).
- **Logística Zaragoza → MSY (escalas vs precio)**: compara **AVE/Iryo/Ouigo a Madrid o Barcelona + vuelo en 1 sola escala con billete único protegido** frente a volar desde el aeropuerto de Zaragoza (**ZAZ**), alertando del problema de billetes separados y cambio de aeropuerto (p. ej. Londres Stansted → Heathrow).
- **Recomendador de hoteles por zona**: compara **CBD / Warehouse District** (mejor relación calidad-precio y descanso), **Faubourg Marigny** (a pie de Frenchmen Street) y **French Quarter**, con enlaces pre-rellenados a Booking y Google Hotels.
- **Ruta de Jazz Tradicional + consejos prácticos**: Preservation Hall, Snug Harbor, The Spotted Cat, Fritzel’s, Three Muses, d.b.a., The Maison, Bamboula’s, Mahogany Jazz Hall, enlace a **WWOZ Livewire**, aviso sobre el cierre de Palm Court, tarifa plana de taxi MSY ($36) vs bus 202 ($1,25), efectivo para propinas y ESTA.
- **Doble conector de WhatsApp + Simulador web local**:
  - **Simulador web estilo WhatsApp** en `http://localhost:3000` (funciona al instante incluso antes de añadir claves API).
  - **Twilio WhatsApp Sandbox** (`/webhook/twilio`) para probarlo con tu padre en WhatsApp real en 3 minutos.
  - **Meta WhatsApp Cloud API** (`/webhook/meta`) para uso permanente (hasta 1.000 mensajes de servicio gratis/mes).

---

## 1. Puesta en marcha local (2 minutos)

```bash
npm install
copy .env.example .env
npm start
```

Abre `http://localhost:3000` en tu navegador y ya podrás probar el simulador.

### Claves recomendadas en `.env`
1. **Motor de IA (muy recomendado):** crea una clave gratuita en [Google AI Studio](https://aistudio.google.com/) y pónla en `GEMINI_API_KEY`. *(También puedes usar `OPENAI_API_KEY`; sin ninguna de las dos funciona el modo guiado offline).*
2. **Precios en tiempo real (opcional):** crea una cuenta gratuita en [SerpApi](https://serpapi.com/) (250 búsquedas/mes gratis) y añade `SERPAPI_API_KEY` para que el bot consulte tarifas reales de Google Flights y Google Hotels al instante.

---

## 2. Conectar a WhatsApp real

### Opción A (Más rápida para empezar hoy): Twilio Sandbox for WhatsApp
No requiere verificación de empresa de Meta y puedes darle acceso a tu padre en unos minutos:
1. Regístrate gratis en [Twilio](https://www.twilio.com/) y abre **Messaging → Try it out → Send a WhatsApp message**.
2. Rellena en `.env`:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `ALLOWED_PHONE_NUMBERS=34XXXXXXXXX` (el móvil de tu padre y el tuyo en formato internacional sin `+`)
3. Expón tu servidor en HTTPS:
   - En pruebas desde tu PC: `ngrok http 3000` y pon esa URL HTTPS en `PUBLIC_BASE_URL=https://xxxx.ngrok-free.app`.
   - O despliega gratis/barato en Render, Railway, Fly.io o un VPS.
4. En Twilio Sandbox Settings → **When a message comes in**, pega:
   `https://tu-dominio-publico/webhook/twilio` (método `POST`).
5. Tu padre solo tiene que enviar el código `join <palabra>` al número de WhatsApp de Twilio Sandbox una vez, ¡y ya puede hablar con su asistente!

### Opción B (Definitiva): Meta WhatsApp Cloud API
1. Entra en [Meta for Developers](https://developers.facebook.com/), crea una app de tipo **Business** y añade el producto **WhatsApp**.
2. En `.env` rellena:
   - `META_WHATSAPP_TOKEN` (Token permanente de usuario del sistema cuando pases a producción)
   - `META_PHONE_NUMBER_ID`
   - `META_APP_SECRET` (en Configuración > Básica de tu app)
   - `META_VERIFY_TOKEN` (una clave secreta tuya, igual que la que pongas en Meta)
   - `STRICT_WEBHOOK_SIGNATURE=true`
3. En Meta → **WhatsApp → Configuración → Webhook**:
   - Callback URL: `https://tu-dominio-publico/webhook/meta`
   - Verify token: el mismo de `META_VERIFY_TOKEN`
   - Suscríbete al campo `messages`.

---

## 3. Tests

```bash
npm test
```
