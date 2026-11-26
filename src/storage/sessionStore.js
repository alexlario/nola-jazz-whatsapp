import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), 'data');
const MAX_HISTORY_MESSAGES = 20;

export class SessionStore {
  constructor(filePath = path.join(DEFAULT_DATA_DIR, 'sessions.json')) {
    this.filePath = filePath;
    this.sessions = new Map();
    this.loaded = false;
    this.writeQueue = Promise.resolve();
  }

  async ensureLoaded() {
    if (this.loaded) return;
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      for (const [key, value] of Object.entries(parsed)) {
        this.sessions.set(key, value);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('[SessionStore] Could not read sessions file, starting fresh:', err.message);
      }
    }
    this.loaded = true;
  }

  async getSession(sessionId) {
    await this.ensureLoaded();
    if (!this.sessions.has(sessionId)) {
      const created = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          selectedWindow: null,
          preferredOrigin: null,
          hotelZone: null,
        },
        history: [],
      };
      this.sessions.set(sessionId, created);
      await this.persist();
    }
    return this.sessions.get(sessionId);
  }

  async appendTurn(sessionId, userText, assistantText, preferencesPatch = null) {
    const session = await this.getSession(sessionId);
    session.history.push(
      { role: 'user', text: userText, ts: new Date().toISOString() },
      { role: 'assistant', text: assistantText, ts: new Date().toISOString() },
    );
    if (session.history.length > MAX_HISTORY_MESSAGES) {
      session.history = session.history.slice(-MAX_HISTORY_MESSAGES);
    }
    if (preferencesPatch && typeof preferencesPatch === 'object') {
      session.preferences = { ...session.preferences, ...preferencesPatch };
    }
    session.updatedAt = new Date().toISOString();
    await this.persist();
    return session;
  }

  async resetSession(sessionId) {
    await this.ensureLoaded();
    this.sessions.delete(sessionId);
    await this.persist();
  }

  async persist() {
    const snapshot = Object.fromEntries(this.sessions.entries());
    const serialized = JSON.stringify(snapshot, null, 2);

    this.writeQueue = this.writeQueue.then(async () => {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const tmpPath = `${this.filePath}.tmp`;
      await fs.writeFile(tmpPath, serialized, 'utf8');
      await fs.rename(tmpPath, this.filePath);
    });

    return this.writeQueue;
  }
}
