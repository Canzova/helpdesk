import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, TicketIcon, Search, Zap, Menu, X } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import ChatPanel from './components/ChatPanel';
import CreateTicketForm from './components/CreateTicketForm';
import LookupTicket from './components/LookupTicket';

const NAV = [
  { id: 'chat',   label: 'AI Support',     icon: MessageSquare },
  { id: 'create', label: 'Create Ticket',  icon: TicketIcon    },
  { id: 'lookup', label: 'Lookup Ticket',  icon: Search        },
];

function newConvId() { return uuidv4(); }

export default function App() {
  const [dark, setDark]           = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [tab, setTab]             = useState('chat');
  const [convId, setConvId]       = useState(newConvId);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  function handleNewConversation() {
    setConvId(newConvId());
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--surface)',
        borderBottom: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--primary) 0%, #a78bfa 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
          }}>
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            EasyBuy <span style={{ color: 'var(--primary)' }}>Help</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}
             className="desktop-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem', fontWeight: 600,
              background: tab === id ? 'var(--primary-light)' : 'transparent',
              color:      tab === id ? 'var(--primary)'       : 'var(--text-muted)',
              border: '1.5px solid',
              borderColor: tab === id ? 'var(--primary)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          {/* Hamburger for mobile */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'none',
              width: 38, height: 38, borderRadius: 8,
              background: 'var(--surface2)', border: '1.5px solid var(--border)',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
            className="hamburger"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </header>

      {/* ── Mobile dropdown menu ─────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          background: 'var(--surface)',
          borderBottom: '1.5px solid var(--border)',
          padding: '8px 16px 12px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}
          className="mobile-menu"
        >
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setMenuOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem', fontWeight: 600, textAlign: 'left',
              background: tab === id ? 'var(--primary-light)' : 'transparent',
              color:      tab === id ? 'var(--primary)'       : 'var(--text-muted)',
              border: 'none',
            }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
        padding: '28px 20px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Page header */}
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {tab === 'chat'   && 'AI Support Chat'}
            {tab === 'create' && 'Create a Ticket'}
            {tab === 'lookup' && 'Lookup Ticket'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            {tab === 'chat'   && 'Chat with Canzova — your intelligent EasyBuy support agent.'}
            {tab === 'create' && 'Submit a new support ticket and get help from our team.'}
            {tab === 'lookup' && 'Find an existing ticket by ID or registered email address.'}
          </p>
        </div>

        {/* Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* ChatPanel is always mounted — hidden with CSS when not active.
              This preserves chat history when switching tabs. */}
          <div style={{
            height: 560, display: tab === 'chat' ? 'flex' : 'none', flexDirection: 'column'
          }}>
            <ChatPanel
              key={convId}
              conversationId={convId}
              onNewConversation={handleNewConversation}
            />
          </div>

          {tab === 'create' && (
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 26px',
              boxShadow: 'var(--shadow)',
            }}>
              <CreateTicketForm />
            </div>
          )}
          {tab === 'lookup' && (
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 26px',
              boxShadow: 'var(--shadow)',
            }}>
              <LookupTicket />
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '16px',
        color: 'var(--text-subtle)', fontSize: '0.75rem',
        borderTop: '1.5px solid var(--border)',
      }}>
        EasyBuy Helpdesk · Powered by Spring AI + GPT-4o-mini
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
}
