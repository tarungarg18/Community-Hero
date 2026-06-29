interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 36, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" fill="#10b981" />
      <path
        d="M20 9L11 13V20C11 25 15.2 29.7 20 31C24.8 29.7 29 25 29 20V13L20 9Z"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M20 16C17.8 16 16 17.8 16 20C16 22.8 20 27 20 27C20 27 24 22.8 24 20C24 17.8 22.2 16 20 16Z"
        fill="white"
      />
      <circle cx="20" cy="20" r="1.8" fill="#10b981" />
    </svg>
  );
}

export function LogoWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={36} />
      <div className="flex flex-col leading-none">
        <span className="font-extrabold text-base text-slate-900 tracking-tight">Community</span>
        <span className="font-extrabold text-base text-brand-600 tracking-tight -mt-0.5">Hero</span>
      </div>
    </div>
  );
}
