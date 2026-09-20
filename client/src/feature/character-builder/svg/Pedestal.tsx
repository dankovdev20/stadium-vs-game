interface PedestalProps {
  className?: string;
}

// Подставка-подиум под манекеном в примерочной — рендерится один раз на
// экран (в отличие от RobotCharacter), поэтому фиксированные id внутри
// <defs> безопасны, дублировать инстанс некому. Цилиндрический барабан +
// верхняя плита с золотым ободом и заклёпками — перекликается с "механи-
// ческим" почерком самого робота (те же заклёпки, что на голове/корпусе).
export default function Pedestal({ className = "" }: PedestalProps) {
  return (
    <svg viewBox="0 0 260 76" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="pedestal-glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(255,201,60,0.32)" />
          <stop offset="100%" stopColor="rgba(255,201,60,0)" />
        </radialGradient>
        <linearGradient id="pedestal-drum" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="55%" stopColor="#262c34" />
          <stop offset="100%" stopColor="#111418" />
        </linearGradient>
        <linearGradient id="pedestal-top" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#606d7d" />
          <stop offset="100%" stopColor="#262c34" />
        </linearGradient>
        <linearGradient id="pedestal-rim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-gold-700)" />
          <stop offset="50%" stopColor="var(--color-gold-500)" />
          <stop offset="100%" stopColor="var(--color-gold-700)" />
        </linearGradient>
      </defs>

      <ellipse cx="130" cy="70" rx="122" ry="10" fill="#000000" opacity="0.38" />
      <ellipse cx="130" cy="18" rx="128" ry="36" fill="url(#pedestal-glow)" />

      {/* цилиндр-барабан */}
      <path d="M 20 32 L 20 50 A 110 18 0 0 0 240 50 L 240 32 Z" fill="url(#pedestal-drum)" />
      <path d="M 20 32 A 110 18 0 0 0 240 32 L 240 34 A 110 18 0 0 1 20 34 Z" fill="#000000" opacity="0.28" />

      {/* верхняя плита */}
      <ellipse cx="130" cy="32" rx="110" ry="18" fill="url(#pedestal-top)" stroke="#0b0e12" strokeWidth="2" />
      <ellipse cx="130" cy="32" rx="110" ry="18" fill="none" stroke="url(#pedestal-rim)" strokeWidth="3" opacity="0.85" />
      <ellipse cx="130" cy="27" rx="86" ry="10" fill="#ffffff" opacity="0.1" />

      {/* заклёпки по ободу — тот же приём, что на голове/корпусе робота */}
      <circle cx="46" cy="40" r="2.6" fill="#0b0e12" opacity="0.7" />
      <circle cx="90" cy="47" r="2.6" fill="#0b0e12" opacity="0.7" />
      <circle cx="170" cy="47" r="2.6" fill="#0b0e12" opacity="0.7" />
      <circle cx="214" cy="40" r="2.6" fill="#0b0e12" opacity="0.7" />
    </svg>
  );
}
