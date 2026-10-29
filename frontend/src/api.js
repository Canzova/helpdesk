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

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      async function pump() {
        let done, value;
        try {
          ({ done, value } = await reader.read());
        } catch (e) {
          // AbortError means the user cancelled — treat as done
          if (e.name !== 'AbortError') onError(e);
          onDone();
          return;
        }

        if (done) { onDone(); return; }

        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by double newlines.
        // Split on \n\n and process complete frames.
        const frames = buffer.split('\n\n');
        // Last element is an incomplete frame (or empty) — keep it in buffer
        buffer = frames.pop();

        for (const frame of frames) {
          for (const line of frame.split('\n')) {
            if (line.startsWith('data:')) {
              // Slice off exactly "data:" — keep everything after verbatim,
              // including spaces. Spring AI streams spaces as their own tokens
              // (e.g. the frame "data: " is a literal space character).
              // DO NOT trim — that's what caused words to merge.
              const token = line.slice(5);
              if (token !== '[DONE]') onChunk(token);
            }
          }
        }

        pump();
      }

      pump();
    })
    .catch((e) => {
      if (e.name === 'AbortError') { onDone(); return; }
      onError(new Error('Cannot reach backend at ' + BASE + '. Is it running?'));
    });

  return () => controller.abort();
}
