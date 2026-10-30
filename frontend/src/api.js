const BASE = 'http://localhost:8080';

// ── Ticket endpoints ────────────────────────────────────────────────────────

export async function createTicket(data) {
  const res = await fetch(`${BASE}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

export async function getTicketById(id) {
  const res = await fetch(`${BASE}/id?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const body = await res.text();
  if (!body) return null;
  return JSON.parse(body);
}

export async function getTicketByEmail(email) {
  const res = await fetch(`${BASE}/email?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const body = await res.text();
  if (!body) return null;
  return JSON.parse(body);
}

// ── AI chat — streaming SSE via fetch ───────────────────────────────────────
// Spring AI's Flux<String> with produces=TEXT_EVENT_STREAM_VALUE sends SSE:
//   data:Hello\n\n
//   data: world\n\n
//
// We use fetch + ReadableStream so we can:
//   - Send the Accept header (required by some Spring MVC configs)
//   - Detect real HTTP errors (CORS, 500) before opening the stream
//   - Cancel mid-stream cleanly
//
// onChunk(text) — called per token
// onDone()      — stream finished
// onError(err)  — network or HTTP error
// Returns a cancel function.
// ── AI chat — streaming SSE helper ──────────────────────────────────────────
async function consumeSseStream(res, onChunk, onDone, onError) {
  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

  async function pump() {
    let done, value;
    try {
      ({ done, value } = await reader.read());
    } catch (e) {
      if (e.name !== 'AbortError') onError(e);
      onDone();
      return;
    }

    if (done) { onDone(); return; }

    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by double newlines.
    // Split on \n\n and process complete frames.
    const frames = buffer.split('\n\n');
    buffer = frames.pop();

    for (const frame of frames) {
      for (const line of frame.split('\n')) {
        if (line.startsWith('data:')) {
          // Slice off exactly "data:" — keep everything after verbatim,
          // including spaces. Spring AI streams spaces as their own tokens.
          const token = line.slice(5);
          if (token !== '[DONE]') onChunk(token);
        }
      }
    }

    pump();
  }

  pump();
}

// ── AI chat — text streaming SSE via fetch ──────────────────────────────────
export function streamChat(conversationId, query, onChunk, onDone, onError) {
  const url =
    `${BASE}/ai/chat` +
    `?conversationId=${encodeURIComponent(conversationId)}` +
    `&query=${encodeURIComponent(query)}`;

  const controller = new AbortController();

  fetch(url, {
    method: 'GET',
    headers: { Accept: 'text/event-stream' },
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        onError(new Error(`HTTP ${res.status}${text ? ': ' + text : ''}`));
        return;
      }
      return consumeSseStream(res, onChunk, onDone, onError);
    })
    .catch((e) => {
      if (e.name === 'AbortError') { onDone(); return; }
      onError(new Error('Cannot reach backend at ' + BASE + '. Is it running?'));
    });

  return () => controller.abort();
}

// ── AI chat — audio voice streaming SSE via fetch ───────────────────────────
export function streamAudioChat(
  conversationId,
  audioBlob,
  filename = 'recording.webm',
  onChunk,
  onDone,
  onError,
  onTranscript
) {
  const url = `${BASE}/ai/audio-input`;
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  formData.append('audioFile', audioBlob, filename);

  const controller = new AbortController();

  fetch(url, {
    method: 'POST',
    headers: { Accept: 'text/event-stream' },
    body: formData,
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        onError(new Error(`HTTP ${res.status}${text ? ': ' + text : ''}`));
        return;
      }

      const rawTranscript = res.headers.get('X-Transcript');
      if (rawTranscript && onTranscript) {
        try {
          const cleaned = decodeURIComponent(rawTranscript.replace(/\+/g, ' '));
          onTranscript(cleaned);
        } catch {
          onTranscript(rawTranscript.replace(/\+/g, ' '));
        }
      }

      return consumeSseStream(res, onChunk, onDone, onError);
    })
    .catch((e) => {
      if (e.name === 'AbortError') { onDone(); return; }
      onError(new Error('Cannot reach backend at ' + BASE + '. Is it running?'));
    });

  return () => controller.abort();
}
