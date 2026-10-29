import { useState } from 'react';
import { getTicketById, getTicketByEmail } from '../api';
import { Search, Loader2 } from 'lucide-react';
import TicketCard from './TicketCard';

export default function LookupTicket() {
  const [mode, setMode]       = useState('id');    // 'id' | 'email'
  const [value, setValue]     = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket]   = useState(undefined); // undefined = not searched yet
  const [error, setError]     = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError('');
    setTicket(undefined);
    try {
      const data = mode === 'id'
        ? await getTicketById(value.trim())
        : await getTicketByEmail(value.trim());
      setTicket(data);
      if (!data) setError('No ticket found for the given ' + (mode === 'id' ? 'ID' : 'email') + '.');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m) {
    setMode(m);
    setValue('');
    setTicket(undefined);
    setError('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Mode tabs */}
      <div style={{
        display: 'inline-flex', borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--border)', overflow: 'hidden',
        alignSelf: 'flex-start',
      }}>
        {[['id', 'By Ticket ID'], ['email', 'By Email']].map(([k, lbl]) => (
          <button key={k} type="button" onClick={() => switchMode(k)} style={{
            padding: '7px 18px', fontSize: '0.82rem', fontWeight: 600,
            background: mode === k ? 'var(--primary)' : 'var(--surface2)',
            color: mode === k ? '#fff' : 'var(--text-muted)',
            border: 'none',
          }}>{lbl}</button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
        <input
          type={mode === 'id' ? 'number' : 'email'}
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); setTicket(undefined); }}
          placeholder={mode === 'id' ? 'Enter ticket ID…' : 'Enter email address…'}
          style={{
            flex: 1, padding: '9px 14px',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface2)', color: 'var(--text)', fontSize: '0.875rem',
          }}
        />
        <button type="submit" disabled={!value.trim() || loading} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 20px', borderRadius: 'var(--radius-sm)',
          background: (!value.trim() || loading) ? 'var(--surface2)' : 'var(--primary)',
          color: (!value.trim() || loading) ? 'var(--text-muted)' : '#fff',
          fontWeight: 700, fontSize: '0.875rem', border: '1.5px solid var(--border)',
        }}>
          {loading
            ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            : <Search size={15} />}
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--warning-light)', color: 'var(--warning)',
          border: '1.5px solid var(--warning)', borderRadius: 'var(--radius-sm)',
          padding: '10px 14px', fontSize: '0.85rem', fontWeight: 500,
        }}>{error}</div>
      )}

      {/* Result */}
      {ticket && <TicketCard ticket={ticket} />}

      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
