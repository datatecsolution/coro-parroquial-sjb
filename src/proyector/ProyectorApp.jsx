import React, { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';

export default function ProyectorApp() {
  const { state, connected, refreshKey } = useSocket();
  const [songs, setSongs] = useState([]);
  const [massLoaded, setMassLoaded] = useState(null);
  const initialLoadDone = useRef(false);

  // Load active mass on mount as fallback
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    fetch('/api/masses/active')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.songs.length > 0) {
          setSongs(data.songs);
          setMassLoaded(data.mass.id);
        }
      })
      .catch(() => {});
  }, []);

  // Load mass songs when massId changes via WebSocket
  useEffect(() => {
    if (!state?.massId || state.massId === massLoaded) return;
    fetch(`/api/masses/${state.massId}/karaoke`)
      .then(r => r.json())
      .then(data => {
        setSongs(data.songs);
        setMassLoaded(state.massId);
      })
      .catch(() => {});
  }, [state?.massId, massLoaded]);

  // Refetch data when admin makes changes
  useEffect(() => {
    if (refreshKey === 0) return;
    if (massLoaded) {
      fetch(`/api/masses/${massLoaded}/karaoke`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setSongs(data.songs);
          }
        })
        .catch(() => {});
    }
  }, [refreshKey]);

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  // Waiting for connection
  if (!connected || !state) {
    return (
      <div
        onClick={requestFullscreen}
        className="bg-black text-gray-500 h-dvh flex flex-col items-center justify-center font-cinzel"
      >
        <p className="text-xl mb-2">Conectando...</p>
        <p className="text-sm opacity-40">
          Abre <strong>/director</strong> en otro dispositivo para controlar
        </p>
      </div>
    );
  }

  const isDark = state.theme === 'dark';
  const base = `h-dvh w-screen flex items-center justify-center overflow-hidden cursor-none select-none ${
    isDark ? 'bg-black text-white' : 'bg-white text-black'
  }`;

  // Blank mode
  if (state.mode === 'blank') {
    return <div className={base} onClick={requestFullscreen} />;
  }

  // Text mode
  if (state.mode === 'text') {
    return (
      <div className={base} onClick={requestFullscreen}>
        <p className={`text-[clamp(32px,6vw,80px)] font-bold text-center px-10 leading-[1.4] max-w-[90%] font-playfair ${
          isDark ? 'text-highlight' : 'text-gray-900'
        }`}>
          {state.customText}
        </p>
      </div>
    );
  }

  // Image mode
  if (state.mode === 'image') {
    return (
      <div className={base} onClick={requestFullscreen}>
        {state.imageUrl && (
          <img src={state.imageUrl} alt="" className="max-w-[90%] max-h-[90%] object-contain" />
        )}
      </div>
    );
  }

  // Song mode
  const song = songs[state.songIndex];
  if (!song) {
    return (
      <div className={`${base} flex-col`} onClick={requestFullscreen}>
        <p className={`text-base font-cinzel ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
          Selecciona un canto desde /director
        </p>
      </div>
    );
  }

  const verse = song.verses[state.verseIndex];
  if (!verse) {
    return <div className={base} onClick={requestFullscreen} />;
  }

  return (
    <div className={`${base} flex-col gap-2 px-15 py-10`} onClick={requestFullscreen}>
      {/* Song title - subtle */}
      <div className={`absolute top-5 left-10 text-base opacity-30 font-cinzel tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>
        {song.title}
        {verse.label ? ` — ${verse.label}` : ''}
      </div>

      {/* Verse lines */}
      <div className="text-center max-w-[90%]">
        {verse.lines.map((line, i) => (
          <p
            key={i}
            className={`text-[clamp(28px,5vw,64px)] leading-[1.5] font-playfair
              ${line.chorus ? 'font-extrabold italic' : 'font-semibold'}
              ${line.chorus
                ? (isDark ? 'text-highlight' : 'text-gray-900')
                : (isDark ? 'text-white' : 'text-black')
              }`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
