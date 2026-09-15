export function KogniLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="32" height="32" rx="9" className="fill-foreground" />
      <path
        d="M11 8.5V23.5M11 16L19.5 8.5M13.8 17.6L20.5 23.5"
        stroke="var(--background)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21.5" cy="10.5" r="1.6" className="fill-brand" />
    </svg>
  );
}
