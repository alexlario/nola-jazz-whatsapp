import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { SessionStore } from '../storage/sessionStore.js';
import { TOOL_SPECS, executeTool } from '../tools/index.js';
import { formatForWhatsApp } from '../utils/whatsappFormat.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { runFallbackReply } from './fallbackEngine.js';

const MAX_TOOL_ROUNDS = 4;
const RECOMMENDED_GEMINI_MODEL = 'gemini-3.8-flash';

function isModelNotFoundError(err) {
  const msg = String(err?.message || '');
  return err?.status === 404 || msg.includes('"code":404') || msg.includes('NOT_FOUND');
}

export class TravelAgent {
  constructor({ sessionStore = new SessionStore() } = {}) {
    this.sessionStore = sessionStore;
    this.activeGeminiModel = config.ai.geminiModel || RECOMMENDED_GEMINI_MODEL;
    this.geminiClient = config.ai.geminiApiKey
      ? new GoogleGenAI({ apiKey: config.ai.geminiApiKey })
      : null;
  }

  async generateWithGeminiFallback(contents, configPayload) {
    try {
      return await this.geminiClient.models.generateContent({
        model: this.activeGeminiModel,
        contents,
        config: configPayload,
      });
    } catch (err) {
      if (this.activeGeminiModel !== RECOMMENDED_GEMINI_MODEL && isModelNotFoundError(err)) {
        console.warn(
          `[TravelAgent] Modelo ${this.activeGeminiModel} no disponible; cambiando a ${RECOMMENDED_GEMINI_MODEL}`,
        );
        this.activeGeminiModel = RECOMMENDED_GEMINI_MODEL;
        return this.geminiClient.models.generateContent({
          model: this.activeGeminiModel,
          contents,
          config: configPayload,
        });
      }
      throw err;
    }
  }

  async runWithGemini(history, userText) {
    const contents = [
      ...history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })),
      { role: 'user', parts: [{ text: userText }] },
    ];

    const functionDeclarations = TOOL_SPECS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parametersJsonSchema: tool.parameters,
    }));

    const systemInstruction = buildSystemPrompt();

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const response = await this.generateWithGeminiFallback(contents, {
        systemInstruction,
        temperature: 0.4,
        tools: [{ functionDeclarations }],
      });

      const calls = response.functionCalls;
      if (!calls || calls.length === 0) {
        return response.text || '';
      }

      const modelContent = response.candidates?.[0]?.content;
      if (modelContent) {
        contents.push(modelContent);
      }

      const responseParts = [];
      for (const call of calls) {
        const result = await executeTool(call.name, call.args || {});
        responseParts.push({
          functionResponse: {
            ...(call.id ? { id: call.id } : {}),
            name: call.name,
            response: { output: result },
          },
        });
      }
      contents.push({ role: 'user', parts: responseParts });
    }

    const finalResponse = await this.generateWithGeminiFallback(contents, {
      systemInstruction,
      temperature: 0.4,
    });
    return finalResponse.text || '';
  }

  async runWithOpenAI(history, userText) {
    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      ...history.map((m) => ({ role: m.role, content: m.text })),
      { role: 'user', content: userText },
    ];

    const tools = TOOL_SPECS.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.ai.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.ai.openaiModel,
          temperature: 0.4,
          messages,
          tools,
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI API HTTP ${res.status}`);
      }
      const data = await res.json();
      const message = data.choices?.[0]?.message;
      if (!message) throw new Error('Respuesta vacía de OpenAI');

      if (!message.tool_calls || message.tool_calls.length === 0) {
        return message.content || '';
      }

      messages.push(message);
      for (const tc of message.tool_calls) {
        let parsedArgs = {};
        try {
          parsedArgs = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          parsedArgs = {};
        }
        const toolResult = await executeTool(tc.function?.name, parsedArgs);
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult),
        });
      }
    }

    return '';
  }

  async reply(sessionId, rawUserText) {
    const userText = String(rawUserText || '').trim();
    if (!userText) {
      return {
        text: 'Escribe tu duda sobre fechas, vuelos desde Zaragoza, hoteles o clubes de jazz en Nueva Orleans y te ayudo encantado.',
        mode: 'empty',
      };
    }

    const session = await this.sessionStore.getSession(sessionId);
    let replyText = '';
    let mode = 'fallback';
    let preferencesPatch = null;

    if (this.geminiClient) {
      try {
        replyText = await this.runWithGemini(session.history, userText);
        mode = 'gemini';
      } catch (err) {
        console.error('[TravelAgent] Error con Gemini, usando motor local de respaldo:', err.message);
      }
    } else if (config.ai.openaiApiKey) {
      try {
        replyText = await this.runWithOpenAI(session.history, userText);
        mode = 'openai';
      } catch (err) {
        console.error('[TravelAgent] Error con OpenAI, usando motor local de respaldo:', err.message);
      }
    }

    if (!replyText) {
      const fb = await runFallbackReply(userText, session);
      replyText = fb.reply;
      preferencesPatch = fb.preferencesPatch;
      mode = 'fallback';
    }

    const formatted = formatForWhatsApp(replyText);
    await this.sessionStore.appendTurn(sessionId, userText, formatted, preferencesPatch);
    return { text: formatted, mode };
  }

  async reset(sessionId) {
    await this.sessionStore.resetSession(sessionId);
  }
}
