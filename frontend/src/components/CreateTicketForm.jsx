import { useState } from 'react';
import { createTicket } from '../api';
import { PlusCircle, Loader2, CheckCircle } from 'lucide-react';
import TicketCard from './TicketCard';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const CATEGORIES = [
  'Billing', 'Technical', 'Account', 'Shipping',
  'Returns', 'Network', 'Hardware', 'Software', 'Other',
];

const empty = { email: '', issueSummary: '', priority: 'MEDIUM', category: '', userContactNumber: '' };

export default function CreateTicketForm() {
  const [form, setForm]       = useState(empty);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [apiError, setApiErr] = useState('');

  function validate() {
    const e = {};
    if (!form.email.trim())               e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.userContactNumber.trim())   e.userContactNumber = 'Contact number is required';
    if (!form.issueSummary.trim())        e.issueSummary = 'Issue description is required';
    if (!form.category)                   e.category = 'Please select a category';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiErr('');
    setLoading(true);
    try {
      const data = await createTicket(form);
      setResult(data);
      setForm(empty);
    } catch (err) {
      setApiErr(err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  }

  function set(k) {
    return e => {
      setForm(f => ({ ...f, [k]: e.target.value }));
      setErrors(er => ({ ...er, [k]: '' }));
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {result && (
        <div style={{
          background: 'var(--success-light)', border: '1.5px solid var(--success)',
          borderRadius: 'var(--radius)', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--success)', fontWeight: 600, fontSize: '0.88rem',
        }}>
          <CheckCircle size={18} />
          Ticket #{result.ticketId} created successfully!
          <button onClick={() => setResult(null)} style={{
            marginLeft: 'auto', background: 'none', color: 'var(--success)',
            fontWeight: 700, fontSize: '1.1rem', padding: 0,
          }}>×</button>
        </div>
      )}

      {result && <TicketCard ticket={result} />}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          <Field label="Email *" error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')}
              placeholder="customer@example.com" style={inputStyle(errors.email)} />
          </Field>
          <Field label="Contact Number *" error={errors.userContactNumber}>
            <input type="tel" value={form.userContactNumber} onChange={set('userContactNumber')}
              placeholder="+91 9876543210" style={inputStyle(errors.userContactNumber)} />
          </Field>
          <Field label="Category *" error={errors.category}>
            <select value={form.category} onChange={set('category')} style={inputStyle(errors.category)}>
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map(p => (
                <button type="button" key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
                    border: '1.5px solid',
                    borderColor: form.priority === p
                      ? (p === 'HIGH' ? 'var(--danger)' : p === 'MEDIUM' ? 'var(--warning)' : 'var(--success)')
                      : 'var(--border)',
                    background: form.priority === p
                      ? (p === 'HIGH' ? 'var(--danger-light)' : p === 'MEDIUM' ? 'var(--warning-light)' : 'var(--success-light)')
                      : 'var(--surface2)',
                    color: form.priority === p
                      ? (p === 'HIGH' ? 'var(--danger)' : p === 'MEDIUM' ? 'var(--warning)' : 'var(--success)')
                      : 'var(--text-muted)',
                  }}
                >{p}</button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Issue Description *" error={errors.issueSummary}>
          <textarea value={form.issueSummary} onChange={set('issueSummary')}
            placeholder="Describe the issue in detail…" rows={4}
            style={{ ...inputStyle(errors.issueSummary), resize: 'vertical', minHeight: 90 }} />
        </Field>

        {apiError && (
          <div style={{
            background: 'var(--danger-light)', color: 'var(--danger)',
            border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-sm)',
            padding: '10px 14px', fontSize: '0.85rem', fontWeight: 500,
          }}>{apiError}</div>
        )}

        <button type="submit" disabled={loading} style={{
          alignSelf: 'flex-start',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 22px', borderRadius: 'var(--radius-sm)',
          background: loading ? 'var(--surface2)' : 'var(--primary)',
          color: loading ? 'var(--text-muted)' : '#fff',
          fontWeight: 700, fontSize: '0.9rem', border: '1.5px solid transparent',
          boxShadow: loading ? 'none' : 'var(--shadow-sm)',
        }}>
          {loading
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</>
            : <><PlusCircle size={16} /> Create Ticket</>
          }
        </button>
      </form>
      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: '0.73rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

function inputStyle(err) {
  return {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 'var(--radius-sm)',
    border: `1.5px solid ${err ? 'var(--danger)' : 'var(--border)'}`,
    background: 'var(--surface2)',
    color: 'var(--text)',
    fontSize: '0.875rem',
  };
}
