export default function Logo({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 24"
      fill="none"
      className={className}
      aria-label="Chrono logo"
      role="img"
    >
      <defs>
        <filter id="chrono-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.2" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="9" cy="7" r="4" fill="#16E5F4" filter="url(#chrono-dot-glow)" />
      <circle cx="9" cy="18" r="3" fill="#075A65" />
    </svg>
  );
}
