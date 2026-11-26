const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');
const statusLine = document.getElementById('status-line');
const healthList = document.getElementById('health-list');

const SESSION_ID = 'sim-papa';

function renderFormattedWhatsAppText(container, text) {
  // Safely render *bold* and https:// links without innerHTML injection
  const tokenRegex = /(\*[^*\n]+\*|https?:\/\/[^\s<>"']+)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(tokenRegex)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      container.appendChild(document.createTextNode(text.slice(lastIndex, idx)));
    }
    const token = match[0];
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      const strong = document.createElement('strong');
      strong.textContent = token.slice(1, -1);
      container.appendChild(strong);
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      const link = document.createElement('a');
      link.href = token;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = token;
      container.appendChild(link);
    } else {
      container.appendChild(document.createTextNode(token));
    }
    lastIndex = idx + token.length;
  }

  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function appendBubble(role, text, metaLabel = '') {
  const div = document.createElement('div');
  div.className = `bubble ${role === 'user' ? 'out' : 'in'}`;
  renderFormattedWhatsAppText(div, text);

  const meta = document.createElement('span');
  meta.className = 'bubble-meta';
  const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  meta.textContent = metaLabel ? `${metaLabel} · ${time}` : time;
  div.appendChild(meta);

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  appendBubble('user', trimmed);
  chatInput.value = '';
  sendBtn.disabled = true;

  const typingBubble = appendBubble('assistant', 'Escribiendo…');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, message: trimmed }),
    });
    const data = await res.json();
    typingBubble.remove();

    if (!res.ok || !data.ok) {
      appendBubble('assistant', data.error || 'No se pudo procesar el mensaje.');
      return;
    }

    const modeBadge = data.mode === 'gemini' ? 'Gemini' : data.mode === 'openai' ? 'OpenAI' : 'Modo local';
    appendBubble('assistant', data.reply, modeBadge);
  } catch {
    typingBubble.remove();
    appendBubble('assistant', 'Error de conexión con el servidor local.');
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

async function loadHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    statusLine.textContent = `${data.aiProvider} · en línea`;

    healthList.replaceChildren();
    const items = [
      `Motor conversacional: ${data.aiProvider}`,
      `Precios en vivo (SerpApi): ${data.livePricesEnabled ? 'Activado' : 'No configurado (usa estimaciones + enlaces)'}`,
      `Meta WhatsApp Cloud API: ${data.metaConfigured ? 'Configurado' : 'Pendiente (.env)'}`,
      `Twilio Sandbox WhatsApp: ${data.twilioConfigured ? 'Configurado' : 'Pendiente (.env)'}`,
      `Lista blanca teléfonos: ${data.whitelistCount > 0 ? `${data.whitelistCount} número(s)` : 'Sin restricción (solo desarrollo)'}`,
    ];
    for (const itemText of items) {
      const li = document.createElement('li');
      li.textContent = itemText;
      healthList.appendChild(li);
    }
  } catch {
    statusLine.textContent = 'Sin conexión';
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  void sendMessage(chatInput.value);
});

for (const chip of document.querySelectorAll('.chip')) {
  chip.addEventListener('click', () => {
    void sendMessage(chip.dataset.msg || '');
  });
}

resetBtn.addEventListener('click', async () => {
  await fetch('/api/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: SESSION_ID }),
  });
  chatMessages.replaceChildren();
  appendBubble(
    'assistant',
    '¡Hola! Soy el asistente del viaje de Zaragoza a Nueva Orleans (febrero 2027) para disfrutar del mejor jazz. Pulsa un botón de abajo o pregúntame por fechas, vuelos o hoteles.',
  );
});

void loadHealth();
appendBubble(
  'assistant',
  '¡Hola! Estoy listo para ayudar a tu padre a planificar su viaje de *Zaragoza a Nueva Orleans en febrero 2027* (fechas, AVE + vuelos con 1 escala, hoteles y clubes de jazz tradicional). Prueba cualquiera de los botones rápidos de abajo.',
);
