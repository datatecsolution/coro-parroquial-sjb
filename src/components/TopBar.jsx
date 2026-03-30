import React, { memo } from 'react';

function TopBar({ song, onMenuClick, onFontIncrease, onFontDecrease }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-3 pt-[calc(env(safe-area-inset-top,0px)+8px)] pb-2 bg-gradient-to-b from-wine-deep/100 via-wine-deep/100 to-transparent backdrop-blur-lg">
      <button
        className="w-[42px] h-[42px] rounded-[10px] border border-gold/30 bg-wine/70 text-gold text-xl flex items-center justify-center cursor-pointer touch-manipulation transition-colors active:bg-gold/20 md:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        &#9776;
      </button>

      <div className="text-center flex-1 px-2 min-w-0">
        {song ? (
          <>
            <div className="font-cinzel text-sm text-gold font-bold whitespace-nowrap overflow-hidden text-ellipsis">{song.title}</div>
            <div className="text-[10px] text-gold-light opacity-50">
              {[song.key, song.author].filter(Boolean).join(' — ')}
            </div>
          </>
        ) : (
          <div className="font-cinzel text-sm text-gold font-bold opacity-40">
            Coro Parroquial SJB
          </div>
        )}
      </div>

      <div className="flex gap-1.5">
        <button
          className="w-[34px] h-[34px] rounded-lg border border-gold/25 bg-wine/70 text-gold text-xs font-cinzel font-bold flex items-center justify-center cursor-pointer touch-manipulation active:bg-gold/20"
          onClick={onFontDecrease}
          aria-label="Reducir texto"
        >
          A-
        </button>
        <button
          className="w-[34px] h-[34px] rounded-lg border border-gold/25 bg-wine/70 text-gold text-xs font-cinzel font-bold flex items-center justify-center cursor-pointer touch-manipulation active:bg-gold/20"
          onClick={onFontIncrease}
          aria-label="Aumentar texto"
        >
          A+
        </button>
      </div>
    </header>
  );
}

export default memo(TopBar);
