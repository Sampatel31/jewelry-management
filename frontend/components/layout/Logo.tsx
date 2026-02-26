export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Shrigar Jewellers gem logo"
      >
        {/* Diamond / gem shape */}
        <polygon
          points="16,2 28,12 16,30 4,12"
          fill="#D4AF37"
          opacity="0.95"
        />
        <polygon
          points="16,2 28,12 16,16"
          fill="#B8962E"
          opacity="0.9"
        />
        <polygon
          points="4,12 16,16 16,30"
          fill="#E8C84A"
          opacity="0.9"
        />
        <polygon
          points="4,12 16,12 16,2"
          fill="#F0D060"
          opacity="0.8"
        />
        <line x1="4" y1="12" x2="28" y2="12" stroke="#6B0F1A" strokeWidth="0.5" opacity="0.4" />
      </svg>
      <span className="text-xl font-bold text-amber-400" style={{ fontFamily: 'Georgia, serif' }}>
        Shrigar Jewellers
      </span>
    </div>
  );
}
