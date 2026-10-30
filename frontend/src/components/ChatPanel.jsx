import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, RefreshCw, Mic, Trash2, AlertCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { streamChat, streamAudioChat } from '../api';

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

/* ── Animated sound bars for active voice recording ──────────────────────── */
function SoundWave() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, height: 20 }}>
      {[0.4, 0.8, 0.3, 0.9, 0.5, 0.7].map((delay, idx) => (
        <span
          key={idx}
          style={{
            width: 3,
            background: 'var(--danger)',
            borderRadius: 2,
            animation: `soundBar 0.8s ease-in-out ${delay * 0.25}s infinite`,
            display: 'inline-block',
          }}
        />
      ))}
    </div>
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
      }}>
        {msg.typing ? (
          <TypingDots />
        ) : isBot ? (
          <BotMarkdown text={msg.text} />
        ) : msg.isVoice ? (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.76rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.2)',
              marginBottom: 6,
            }}>
              <Mic size={12} />
              <span>Voice note ({msg.duration || '0:00'})</span>
            </div>
            {msg.transcribing && !msg.transcript ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: '0.84rem',
                opacity: 0.92,
                padding: '2px 0',
              }}>
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontStyle: 'italic' }}>Transcribing…</span>
              </div>
            ) : msg.transcript ? (
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 2 }}>{msg.transcript}</div>
            ) : null}
          </div>
        ) : (
          <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}

/* ── Chat panel ───────────────────────────────────────────────────────────── */
export default function ChatPanel({ conversationId, onNewConversation }) {
  const [messages, setMessages] = useState([
    { id: 'init', role: 'bot', text: "Hi! I'm **Canzova** 👋 — your EasyBuy support agent.\n\nHow can I help you today?" }
  ]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [isRecording, setIsRecording]     = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [micError, setMicError]           = useState(null);

  const bottomRef             = useRef(null);
  const cancelRef             = useRef(null);
  const streamingIdRef        = useRef(null);

  // Recording refs
  const mediaStreamRef        = useRef(null);
  const mediaRecorderRef      = useRef(null);
  const audioChunksRef        = useRef([]);
  const timerIntervalRef      = useRef(null);
  const isCancelledRef        = useRef(false);
  const recordingStartRef     = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up recording tracks & streaming on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (cancelRef.current) cancelRef.current();
    };
  }, []);

  /* ── Send text query ────────────────────────────────────────────────────── */
  const send = useCallback(() => {
    const q = input.trim();
    if (!q || loading || isRecording) return;

    setInput('');
    setLoading(true);
    setMicError(null);

    const userMsg = { id: `${Date.now()}-u`, role: 'user', text: q };
    const thinkId = `${Date.now()}-t`;
    const botId   = `${Date.now()}-b`;

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: thinkId, role: 'bot', typing: true, text: '' },
    ]);

    let accumulated = '';
    streamingIdRef.current = botId;

    cancelRef.current = streamChat(
      conversationId,
      q,
      (chunk) => {
        accumulated += chunk;
        setMessages(prev => {
          const hasThink = prev.some(m => m.id === thinkId);
          if (hasThink) {
            return prev.map(m =>
              m.id === thinkId ? { id: botId, role: 'bot', text: accumulated } : m
            );
          }
          return prev.map(m =>
            m.id === botId ? { ...m, text: accumulated } : m
          );
        });
      },
      () => {
        streamingIdRef.current = null;
        setLoading(false);
      },
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
  }, [input, loading, isRecording, conversationId]);

  /* ── Send recorded audio blob ───────────────────────────────────────────── */
  const sendAudio = useCallback((blob, filename, durationSec) => {
    if (loading) return;
    setLoading(true);
    setMicError(null);

    const min = Math.floor(durationSec / 60);
    const sec = durationSec % 60;
    const durStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

    const userMsgId = `${Date.now()}-u`;
    const thinkId   = `${Date.now()}-t`;
    const botId     = `${Date.now()}-b`;

    const userMsg = {
      id: userMsgId,
      role: 'user',
      isVoice: true,
      duration: durStr,
      transcript: null,
      transcribing: true,
    };

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: thinkId, role: 'bot', typing: true, text: '' },
    ]);

    let accumulated = '';
    streamingIdRef.current = botId;

    cancelRef.current = streamAudioChat(
      conversationId,
      blob,
      filename,
      // onChunk
      (chunk) => {
        accumulated += chunk;
        setMessages(prev => {
          const hasThink = prev.some(m => m.id === thinkId);
          if (hasThink) {
            return prev.map(m =>
              m.id === thinkId ? { id: botId, role: 'bot', text: accumulated } : m
            );
          }
          return prev.map(m =>
            m.id === botId ? { ...m, text: accumulated } : m
          );
        });
      },
      // onDone
      () => {
        streamingIdRef.current = null;
        setMessages(prev =>
          prev.map(m =>
            m.id === userMsgId && m.transcribing
              ? { ...m, transcribing: false }
              : m
          )
        );
        setLoading(false);
      },
      // onError
      (err) => {
        streamingIdRef.current = null;
        setMessages(prev =>
          prev.map(m => {
            if (m.id === userMsgId) {
              return { ...m, transcribing: false };
            }
            if (m.id === thinkId || m.id === botId) {
              return {
                id: botId,
                role: 'bot',
                text: `⚠️ **${err.message || 'Something went wrong.'}**\n\nFailed to process audio or reach backend.`,
              };
            }
            return m;
          })
        );
        setLoading(false);
      },
      // onTranscript - from backend X-Transcript header
      (transcriptText) => {
        if (transcriptText) {
          setMessages(prev =>
            prev.map(m =>
              m.id === userMsgId
                ? { ...m, transcript: transcriptText, transcribing: false }
                : m
            )
          );
        }
      }
    );
  }, [loading, conversationId]);

  /* ── Stop or cancel recording ───────────────────────────────────────────── */
  const stopRecording = useCallback((cancel = false) => {
    isCancelledRef.current = cancel;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (cancel) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
      setRecordDuration(0);
    }
  }, []);

  /* ── Start voice recording ──────────────────────────────────────────────── */
  const startRecording = useCallback(async () => {
    if (loading || isRecording) return;
    setMicError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Voice recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Detect best supported mime type
      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ];
      let selectedMime = '';
      for (const mime of candidates) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      isCancelledRef.current = false;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Stop audio tracks immediately to free hardware
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
          mediaStreamRef.current = null;
        }
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        const wasCancelled = isCancelledRef.current;
        const totalDuration = Math.max(1, Math.floor((Date.now() - recordingStartRef.current) / 1000));

        setIsRecording(false);
        setRecordDuration(0);

        if (wasCancelled) return;

        const effectiveMime = recorder.mimeType || selectedMime || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: effectiveMime });

        if (blob.size < 200) {
          setMicError('Recording was too short. Please try again.');
          return;
        }

        let ext = 'webm';
        if (effectiveMime.includes('mp4')) ext = 'mp4';
        else if (effectiveMime.includes('ogg')) ext = 'ogg';
        else if (effectiveMime.includes('wav')) ext = 'wav';

        sendAudio(blob, `voice_${Date.now()}.${ext}`, totalDuration);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);
      recordingStartRef.current = Date.now();

      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        setRecordDuration(elapsed);
        // Automatically stop at 2 minutes limit
        if (elapsed >= 120) {
          stopRecording(false);
        }
      }, 500);

    } catch (err) {
      console.error('Microphone access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission was denied. Please allow microphone access.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError('No microphone found on your device.');
      } else {
        setMicError(`Microphone error: ${err.message || 'unknown error'}`);
      }
      setIsRecording(false);
    }
  }, [loading, isRecording, sendAudio, stopRecording]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
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

      {/* ── Mic error banner (if any) ── */}
      {micError && (
        <div style={{
          padding: '8px 14px',
          background: 'var(--danger-light)',
          borderTop: '1.5px solid var(--danger)',
          color: 'var(--danger)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{micError}</span>
          </div>
          <button
            onClick={() => setMicError(null)}
            title="Dismiss"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{
        padding: '11px 13px',
        borderTop: '1.5px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        {isRecording ? (
          /* ── Recording mode ── */
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flex: 1, width: '100%',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flex: 1,
              padding: '9px 14px',
              background: 'var(--danger-light)',
              border: '1.5px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
            }}>
              <span style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: 'var(--danger)',
                animation: 'pulseDot 1s infinite',
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <SoundWave />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace' }}>
                {formatTimer(recordDuration)}
              </span>
              <span style={{ fontSize: '0.78rem', opacity: 0.85, display: 'inline-block', marginLeft: 4 }}>
                Listening…
              </span>
            </div>

            {/* Cancel recording */}
            <button
              onClick={() => stopRecording(true)}
              title="Cancel recording"
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'var(--surface2)',
                color: 'var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--border)',
              }}
            >
              <Trash2 size={16} />
            </button>

            {/* Stop & Send recording */}
            <button
              onClick={() => stopRecording(false)}
              title="Send voice message"
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none',
                boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        ) : (
          /* ── Normal typing mode ── */
          <>
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

            {/* Microphone button */}
            <button
              onClick={startRecording}
              disabled={loading}
              title="Record voice message"
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'var(--surface2)',
                color: loading ? 'var(--text-subtle)' : 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--border)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Mic size={17} />
            </button>

            {/* Send button */}
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              title="Send message"
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
          </>
        )}
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
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.3; transform: scale(0.85); }
        }
        @keyframes soundBar {
          0%, 100% { height: 4px; }
          50%      { height: 16px; }
        }
        /* Remove trailing margin from last markdown element in a bubble */
        .md-bubble > *:last-child { margin-bottom: 0 !important; }
      `}</style>
    </div>
  );
}
