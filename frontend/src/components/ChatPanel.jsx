import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { streamChat } from '../api';

/* ── Typing dots ──────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--text-subtle)', display: 'inline-block',
          animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </span>
  );
}

/* ── Markdown renderer for bot messages ──────────────────────────────────── */
function BotMarkdown({ text }) {
  return (
    <ReactMarkdown
      components={{
        // Paragraphs — no extra margins, let the bubble handle spacing
        p: ({ children }) => (
          <p style={{ margin: '0 0 8px 0', lineHeight: 1.65 }}>{children}</p>
        ),
        // Bold
        strong: ({ children }) => (
          <strong style={{ fontWeight: 700, color: 'inherit' }}>{children}</strong>
        ),
        // Ordered list
        ol: ({ children }) => (
          <ol style={{ margin: '6px 0 8px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {children}
          </ol>
        ),
        // Unordered list
        ul: ({ children }) => (
          <ul style={{ margin: '6px 0 8px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li style={{ lineHeight: 1.6 }}>{children}</li>
        ),
        // Inline code
        code: ({ inline, children }) =>
          inline ? (
            <code style={{
              background: 'var(--surface2)', padding: '1px 5px',
              borderRadius: 4, fontSize: '0.82em',
              fontFamily: 'monospace', color: 'var(--primary)',
            }}>{children}</code>
          ) : (
            <pre style={{
              background: 'var(--surface2)', padding: '10px 12px',
              borderRadius: 8, overflowX: 'auto', margin: '8px 0',
              fontSize: '0.82em', fontFamily: 'monospace',
            }}><code>{children}</code></pre>
          ),
        // Headings inside chat bubbles
        h1: ({ children }) => <p style={{ fontWeight: 800, fontSize: '1em', margin: '8px 0 4px' }}>{children}</p>,
        h2: ({ children }) => <p style={{ fontWeight: 700, fontSize: '0.97em', margin: '8px 0 4px' }}>{children}</p>,
        h3: ({ children }) => <p style={{ fontWeight: 700, fontSize: '0.94em', margin: '6px 0 4px' }}>{children}</p>,
        // Horizontal rule
        hr:  () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/* ── Single message bubble ────────────────────────────────────────────────── */
function Message({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <div style={{
      display: 'flex',
      flexDirection: isBot ? 'row' : 'row-reverse',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isBot ? 'var(--primary-light)' : 'var(--surface2)',
        border: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isBot ? 'var(--primary)' : 'var(--text-muted)',
        marginTop: 2,
      }}>
        {isBot ? <Bot size={15} /> : <User size={15} />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        background: isBot ? 'var(--surface)' : 'var(--primary)',
        color: isBot ? 'var(--text)' : '#fff',
        border: isBot ? '1.5px solid var(--border)' : 'none',
        borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        padding: '10px 14px',
        fontSize: '0.875rem',
        lineHeight: 1.6,
        boxShadow: 'var(--shadow-sm)',
        wordBreak: 'break-word',
        // Remove bottom-margin of last markdown element inside the bubble
      }}>
        {msg.typing
          ? <TypingDots />
          : isBot
            ? <BotMarkdown text={msg.text} />
            : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
        }
      </div>
    </div>
  );
}

/* ── Chat panel ───────────────────────────────────────────────────────────── */
export default function ChatPanel({ conversationId, onNewConversation }) {
  const [messages, setMessages] = useState([
    { id: 'init', role: 'bot', text: "Hi! I'm **Canzova** 👋 — your EasyBuy support agent.\n\nHow can I help you today?" }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const cancelRef             = useRef(null);
  // Tracks the bot message ID that is currently being streamed into
  const streamingIdRef        = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(() => {
    const q = input.trim();
    if (!q || loading) return;

    setInput('');
    setLoading(true);

    const userMsg = { id: `${Date.now()}-u`, role: 'user', text: q };
    const thinkId = `${Date.now()}-t`;
    const botId   = `${Date.now()}-b`;

    // Add user message + typing placeholder
    setMessages(prev => [
      ...prev,
      userMsg,
      { id: thinkId, role: 'bot', typing: true, text: '' },
    ]);

    // We accumulate text in a ref to avoid stale closures; state updates are
    // batched so reading prev text from state inside onChunk can lag.
    let accumulated = '';
    streamingIdRef.current = botId;

    cancelRef.current = streamChat(
      conversationId,
      q,
      // onChunk — called per SSE token
      (chunk) => {
        accumulated += chunk;
        setMessages(prev => {
          // First chunk: replace typing bubble with real bot bubble
          const hasThink = prev.some(m => m.id === thinkId);
          if (hasThink) {
            return prev.map(m =>
              m.id === thinkId
                ? { id: botId, role: 'bot', text: accumulated }
                : m
            );
          }
          // Subsequent chunks: update the bot bubble in-place
          return prev.map(m =>
            m.id === botId ? { ...m, text: accumulated } : m
          );
        });
      },
      // onDone
      () => {
        streamingIdRef.current = null;
        setLoading(false);
      },
      // onError
      (err) => {
        streamingIdRef.current = null;
        setMessages(prev =>
          prev.map(m =>
            (m.id === thinkId || m.id === botId)
              ? {
                  id: botId, role: 'bot',
                  text: `⚠️ **${err.message || 'Something went wrong.'}**\n\nMake sure the Spring Boot backend is running on port 8080.`,
                }
              : m
          )
        );
        setLoading(false);
      }
    );
  }, [input, loading, conversationId]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '13px 18px',
        borderBottom: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Bot size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Canzova AI</div>
            <div style={{ fontSize: '0.71rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              EasyBuy Support
            </div>
          </div>
        </div>

        <button
          onClick={onNewConversation}
          title="Start new conversation"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 13px', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface2)', border: '1.5px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600,
          }}
        >
          <RefreshCw size={13} /> New chat
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '18px 16px',
        display: 'flex', flexDirection: 'column', gap: 14,
        background: 'var(--bg)',
      }}>
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        padding: '11px 13px',
        borderTop: '1.5px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'flex-end', gap: 9,
        flexShrink: 0,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about orders, returns, refunds… (Enter to send)"
          rows={1}
          style={{
            flex: 1, resize: 'none',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '9px 13px',
            fontSize: '0.875rem',
            background: 'var(--surface2)',
            color: 'var(--text)',
            lineHeight: 1.5,
            maxHeight: 120,
            overflow: 'auto',
          }}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: (!input.trim() || loading) ? 'var(--surface2)' : 'var(--primary)',
            color:      (!input.trim() || loading) ? 'var(--text-subtle)' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--border)',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {loading
            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            : <Send size={16} />
          }
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40%           { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Remove trailing margin from last markdown element in a bubble */
        .md-bubble > *:last-child { margin-bottom: 0 !important; }
      `}</style>
    </div>
  );
}
