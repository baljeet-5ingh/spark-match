"use client";

export function TinderSearchLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 select-none">
      {/* Ripple Radar */}
      <div className="relative w-28 h-28">
        {/* Outer ripple */}
        <span className="absolute inset-0 rounded-full 
          bg-gradient-to-r from-rose-500/40 via-orange-500/40 to-rose-500/40
          animate-ping opacity-70"
        />

        {/* Middle ripple */}
        <span className="absolute inset-3 rounded-full 
          bg-gradient-to-r from-rose-500/30 via-orange-500/30 to-rose-500/30
          animate-ping opacity-60 [animation-delay:300ms]"
        />

        {/* Inner pulse */}
        <span className="absolute inset-8 rounded-full 
          bg-gradient-to-r from-rose-500 to-orange-500
          shadow-[0_0_20px_rgba(255,99,99,0.6)]
          animate-pulse"
        />
      </div>

      {/* Text */}
      <p className="text-lg font-medium text-muted-foreground animate-bounce tracking-wide">
        Finding people near you…
      </p>
    </div>
  );
}
