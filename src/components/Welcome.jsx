import React, { memo } from 'react';

function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center p-5 animate-[fadeIn_0.8s_ease]">
      <div className="text-6xl text-gold drop-shadow-[0_0_40px_rgba(201,168,76,0.3)] mb-4">&#10013;</div>
      <h2 className="font-cinzel text-2xl text-gold font-black tracking-widest mb-2.5">Coro Parroquial SJB</h2>
      <p className="text-sm text-cream-dark opacity-60 italic max-w-[280px] leading-relaxed">
        Selecciona un canto del menú para comenzar.
        Usa los controles o desliza para avanzar las letras.
      </p>
      <div className="text-4xl mt-4 opacity-50">&#127807;</div>
    </div>
  );
}

export default memo(Welcome);
