import React, { memo } from 'react';

const SongItem = memo(function SongItem({ song, index, isActive, onSelect }) {
  return (
    <div
      className={`px-4 py-3.5 cursor-pointer border-l-3 transition-all duration-200 touch-manipulation ${
        isActive
          ? 'bg-gold/12 border-l-gold'
          : 'border-l-transparent active:bg-gold/12'
      }`}
      onClick={() => onSelect(index)}
      role="button"
      tabIndex={0}
      aria-label={`Seleccionar ${song.title}`}
    >
      <div className="font-cinzel text-[9px] text-gold-dark tracking-[2px] uppercase mb-0.5">{song.section}</div>
      <div className="font-cinzel text-[13px] text-cream font-bold leading-tight">{song.title}</div>
      {(song.key || song.author) && (
        <div className="text-[10px] text-gold-light opacity-50 mt-0.5 italic">
          {[song.key, song.author].filter(Boolean).join(' — ')}
        </div>
      )}
    </div>
  );
});

function Sidebar({ songs, currentSongIndex, open, onSelect, massInfo }) {
  const massTitle = massInfo?.name || 'Santa Misa';
  const massDate = massInfo?.date
    ? new Date(massInfo.date + 'T12:00:00').toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-[300px] bg-gradient-to-b from-wine-deep via-wine to-[#2A1A0E] border-r border-gold/25 z-100 flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
        open ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
      aria-label="Lista de cantos"
    >
      <div className="pt-[calc(env(safe-area-inset-top,0px)+20px)] px-4 pb-4 text-center border-b border-gold/20 shrink-0">
        <span className="text-[32px] text-gold block mb-1.5 drop-shadow-[0_0_20px_rgba(201,168,76,0.35)]">&#10013;</span>
        <h1 className="font-cinzel text-[13px] tracking-[2.5px] text-gold uppercase leading-relaxed">{massTitle}</h1>
        <div className="text-[11px] text-gold-light opacity-60 italic mt-0.5">{massDate || 'Cantos de la Santa Misa'}</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-gold-dark [&::-webkit-scrollbar-thumb]:rounded">
        {songs.map((song, i) => (
          <SongItem
            key={i}
            song={song}
            index={i}
            isActive={i === currentSongIndex}
            onSelect={onSelect}
          />
        ))}
      </nav>
    </aside>
  );
}

export default memo(Sidebar);
