export default function StatusChip({ label, tone = 'muted', dot = false, solid = false }) {
  const textTone = {
    cyan: 'text-chrono-cyan',
    muted: 'text-chrono-muted',
    paused: 'text-chrono-paused',
    critical: 'text-chrono-critical',
    text: 'text-chrono-text',
  }[tone] || 'text-chrono-muted';

  if (solid) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-[4px] bg-chrono-cyan px-2 py-[3px] font-mono text-[11px] font-semibold text-black no-tap`}>
        {dot && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[4px] border border-chrono-borderSoft bg-chrono-surface2 px-2 py-[3px] font-mono text-[11px] font-medium ${textTone} no-tap`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${tone === 'cyan' ? 'bg-chrono-cyan' : tone === 'paused' ? 'bg-chrono-paused' : 'bg-chrono-muted'}`} />}
      {label}
    </span>
  );
}