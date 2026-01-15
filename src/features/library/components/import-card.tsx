"use client";

export function ImportCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex cursor-pointer aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/20 transition-all duration-500 hover:from-white/15 hover:to-white/10 hover:ring-primary/60 hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.4)]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-white/5 backdrop-blur-sm transition-all duration-500 group-hover:scale-125 group-hover:border-primary/60 group-hover:bg-primary/15">
        <svg
          className="h-8 w-8 text-white/50 transition-colors duration-500 group-hover:text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <div className="absolute inset-0 -z-10 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:bg-primary/30 group-hover:opacity-100" />
      </div>
      <p className="text-white/60 text-xs font-medium mt-4 group-hover:text-primary/80 transition-colors">
        Add Build
      </p>
    </button>
  );
}
