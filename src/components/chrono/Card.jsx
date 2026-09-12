export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-xl bg-chrono-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}