const colorMap = {
  // Priority
  HIGH:    { bg: 'var(--danger-light)',  color: 'var(--danger)'  },
  MEDIUM:  { bg: 'var(--warning-light)', color: 'var(--warning)' },
  LOW:     { bg: 'var(--success-light)', color: 'var(--success)' },
  // Status
  OPEN:    { bg: 'var(--primary-light)', color: 'var(--primary)' },
  PENDING: { bg: 'var(--warning-light)', color: 'var(--warning)' },
  CLOSED:  { bg: 'var(--surface2)',      color: 'var(--text-muted)' },
};

export default function Badge({ label }) {
  const style = colorMap[label] || { bg: 'var(--surface2)', color: 'var(--text-muted)' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 10px',
      borderRadius: 99,
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      background: style.bg,
      color: style.color,
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  );
}
