import Badge from './Badge';
import { Ticket, Mail, Phone, Clock, Tag } from 'lucide-react';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function TicketCard({ ticket }) {
  if (!ticket) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)',
          }}>
            <Ticket size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ticket</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>#{ticket.ticketId}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ticket.priority && <Badge label={ticket.priority} />}
          {ticket.status   && <Badge label={ticket.status}   />}
        </div>
      </div>

      {/* Issue */}
      {ticket.issueSummary && (
        <p style={{ color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.55 }}>
          {ticket.issueSummary}
        </p>
      )}

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px 16px' }}>
        <MetaRow icon={<Mail size={13} />}  label="Email"    value={ticket.email} />
        <MetaRow icon={<Phone size={13} />} label="Phone"    value={ticket.userContactNumber} />
        <MetaRow icon={<Tag size={13} />}   label="Category" value={ticket.category} />
        <MetaRow icon={<Clock size={13} />} label="Created"  value={fmt(ticket.createdAt)} />
        <MetaRow icon={<Clock size={13} />} label="Updated"  value={fmt(ticket.updatedAt)} />
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-subtle)', fontSize: '0.70rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon} {label}
      </div>
      <div style={{ color: 'var(--text)', fontSize: '0.84rem', fontWeight: 500 }}>{value}</div>
    </div>
  );
}
