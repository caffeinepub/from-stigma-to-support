import { useEffect, useState } from 'react';

export default function BreathingAnimation() {
  const [isBreathingIn, setIsBreathingIn] = useState(true);

  useEffect(() => {
    // Alternate between breathe in (4s) and breathe out (4s)
    const interval = setInterval(() => {
      setIsBreathingIn((prev) => !prev);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      {/* Breathing Orb Container */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer gradient pulse background */}
        <div
          className={`absolute rounded-full transition-all duration-[4000ms] ease-in-out ${
            isBreathingIn
              ? 'w-48 h-48 md:w-64 md:h-64 opacity-20'
              : 'w-32 h-32 md:w-40 md:h-40 opacity-10'
          }`}
          style={{
            background: 'radial-gradient(circle, oklch(var(--primary) / 0.4), oklch(var(--accent) / 0.2))',
          }}
        />

        {/* Middle pulse ring */}
        <div
          className={`absolute rounded-full transition-all duration-[4000ms] ease-in-out ${
            isBreathingIn
              ? 'w-40 h-40 md:w-52 md:h-52 opacity-30'
              : 'w-28 h-28 md:w-36 md:h-36 opacity-15'
          }`}
          style={{
            background: 'radial-gradient(circle, oklch(var(--primary) / 0.5), oklch(var(--accent) / 0.3))',
          }}
        />

        {/* Main breathing orb */}
        <div
          className={`relative rounded-full shadow-2xl transition-all duration-[4000ms] ease-in-out ${
            isBreathingIn
              ? 'w-32 h-32 md:w-44 md:h-44'
              : 'w-24 h-24 md:w-32 md:h-32'
          }`}
          style={{
            background: 'radial-gradient(circle at 30% 30%, oklch(0.75 0.15 260), oklch(0.6 0.18 240))',
            boxShadow: isBreathingIn
              ? '0 0 60px oklch(var(--primary) / 0.6), 0 0 100px oklch(var(--accent) / 0.4)'
              : '0 0 30px oklch(var(--primary) / 0.4), 0 0 50px oklch(var(--accent) / 0.2)',
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 40% 40%, oklch(0.95 0.05 280 / 0.8), transparent 70%)',
            }}
          />
        </div>
      </div>

      {/* Breathing Text */}
      <div className="text-center">
        <p
          className={`text-2xl md:text-3xl font-medium transition-all duration-1000 ease-in-out ${
            isBreathingIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            color: 'oklch(var(--primary))',
            textShadow: '0 2px 10px oklch(var(--primary) / 0.3)',
          }}
        >
          {isBreathingIn && 'Breathe In…'}
        </p>
        <p
          className={`text-2xl md:text-3xl font-medium transition-all duration-1000 ease-in-out absolute ${
            !isBreathingIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            color: 'oklch(var(--accent))',
            textShadow: '0 2px 10px oklch(var(--accent) / 0.3)',
          }}
        >
          {!isBreathingIn && 'Breathe Out…'}
        </p>
      </div>

      {/* Subtle instruction text */}
      <p className="text-sm md:text-base text-muted-foreground mt-8 text-center max-w-md px-4">
        Take a moment to center yourself. Follow the rhythm and let your breath guide you to calm.
      </p>
    </div>
  );
}
