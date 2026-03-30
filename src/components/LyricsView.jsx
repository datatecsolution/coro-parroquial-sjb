import React, { memo, useEffect, useRef } from 'react';

function LyricsView({ song, activeVerseIndex, fontSize }) {
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeVerseIndex]);

  return (
    <div style={{ '--lyric-size': `${fontSize}px` }}>
      {song.verses.map((verse, vi) => {
        const isActive = vi === activeVerseIndex;
        return (
          <div
            key={vi}
            ref={isActive ? activeRef : null}
            className={`mb-5 p-4 rounded-[10px] relative transition-all duration-400 animate-[slideUp_0.4s_ease_both] md:p-5 md:px-6
              before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l before:transition-all before:duration-300
              ${isActive
                ? 'bg-gold/6 border border-gold/20 shadow-[0_0_30px_rgba(201,168,76,0.06)] before:opacity-100 before:bg-gold'
                : 'bg-cream/2 border border-gold/6 before:opacity-20 before:bg-gold-dark'
              }`}
            style={{ animationDelay: `${vi * 0.06}s` }}
          >
            {verse.label && (
              <span className="font-cinzel text-[9px] tracking-[2.5px] uppercase text-gold-dark mb-2 block">{verse.label}</span>
            )}
            {verse.lines.map((line, li) => (
              <div
                key={li}
                className={`font-playfair leading-[1.65] py-[3px] px-[2px] select-none transition-all duration-400
                  ${line.chorus ? 'font-bold italic' : ''}
                  ${isActive
                    ? `opacity-100 font-semibold scale-[1.015] ${line.chorus ? 'text-highlight drop-shadow-[0_0_32px_rgba(255,215,0,0.4)]' : 'text-gold drop-shadow-[0_0_24px_rgba(201,168,76,0.35)]'}`
                    : `opacity-50 ${line.chorus ? 'text-gold-light' : 'text-cream-dark'}`
                  }`}
                style={{ fontSize: 'var(--lyric-size, 20px)' }}
              >
                {line.text}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default memo(LyricsView);
