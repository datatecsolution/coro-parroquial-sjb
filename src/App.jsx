import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSocket from './hooks/useSocket';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Welcome from './components/Welcome';
import LyricsView from './components/LyricsView';

export default function App() {
  const [searchParams] = useSearchParams();
  const { state: wsState, refreshKey } = useSocket();

  const [songs, setSongs] = useState([]);
  const [massInfo, setMassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [activeVerseIndex, setActiveVerseIndex] = useState(-1);
  const [fontSize, setFontSize] = useState(20);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [massLoaded, setMassLoaded] = useState(null);

  // Load songs from API
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      const massId = searchParams.get('mass');
      try {
        const url = massId ? `/api/masses/${massId}/karaoke` : '/api/masses/active';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSongs(data.songs);
          setMassInfo(data.mass);
          setMassLoaded(data.mass.id);
        }
      } catch (e) {
        console.error('Failed to load mass:', e);
      }
      setLoading(false);
    };
    loadSongs();
  }, [searchParams]);

  // Refetch data when admin makes changes
  useEffect(() => {
    if (refreshKey === 0) return;
    const massId = searchParams.get('mass');
    const url = massId ? `/api/masses/${massId}/karaoke` : '/api/masses/active';
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setSongs(data.songs);
          setMassInfo(data.mass);
          setMassLoaded(data.mass.id);
        }
      })
      .catch(() => {});
  }, [refreshKey]);

  // Sync with director via WebSocket
  useEffect(() => {
    if (!wsState) return;
    if (wsState.massId && wsState.massId !== massLoaded) {
      fetch(`/api/masses/${wsState.massId}/karaoke`)
        .then(r => r.json())
        .then(data => {
          setSongs(data.songs);
          setMassInfo(data.mass);
          setMassLoaded(wsState.massId);
        })
        .catch(() => {});
    }
    if (wsState.mode === 'song') {
      if (wsState.songIndex !== undefined && wsState.songIndex !== currentSongIndex) {
        setCurrentSongIndex(wsState.songIndex);
        setSidebarOpen(false);
      }
      if (wsState.verseIndex !== undefined) {
        setActiveVerseIndex(wsState.verseIndex);
      }
    }
  }, [wsState, massLoaded, currentSongIndex]);

  const loadSong = useCallback((index) => {
    setCurrentSongIndex(index);
    setActiveVerseIndex(-1);
    setSidebarOpen(false);
  }, []);

  const increaseFontSize = useCallback(() => setFontSize((s) => Math.min(s + 2, 40)), []);
  const decreaseFontSize = useCallback(() => setFontSize((s) => Math.max(s - 2, 14)), []);

  // Touch swipe for sidebar
  const touchRef = useRef({ startX: 0, startY: 0 });
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchRef.current.startX;
      const dy = e.changedTouches[0].clientY - touchRef.current.startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        setSidebarOpen(dx > 0);
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const currentSong = currentSongIndex >= 0 ? songs[currentSongIndex] : null;

  if (loading) {
    return (
      <div className="flex min-h-dvh relative bg-wine-deep">
        <div className="flex-1 flex flex-col min-h-dvh w-full">
          <div className="flex-1 relative bg-wine-deep flex flex-col items-center justify-center min-h-[60dvh] text-center p-5 animate-[fadeIn_0.8s_ease]">
            <div className="text-6xl text-gold mb-4">&#10013;</div>
            <div className="font-cinzel text-2xl text-gold font-black tracking-widest">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex min-h-dvh relative bg-wine-deep">
        <div className="flex-1 flex flex-col min-h-dvh w-full">
          <div className="flex-1 relative bg-wine-deep flex flex-col items-center justify-center min-h-[60dvh] text-center p-5 animate-[fadeIn_0.8s_ease]">
            <div className="text-6xl text-gold mb-4">&#10013;</div>
            <div className="font-cinzel text-2xl text-gold font-black tracking-widest mb-2.5">Coro Parroquial SJB</div>
            <p className="text-sm text-cream-dark opacity-60 italic max-w-[280px] leading-relaxed">
              No hay misas programadas.
              <br />
              <a href="/admin" className="text-gold underline mt-4 inline-block">
                Ir al panel de admin
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh relative bg-wine-deep text-cream">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-90 ${sidebarOpen ? 'block animate-[fadeIn_0.25s_ease]' : 'hidden'} md:!hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        songs={songs}
        currentSongIndex={currentSongIndex}
        open={sidebarOpen}
        onSelect={loadSong}
        massInfo={massInfo}
      />

      <div className="flex-1 flex flex-col min-h-dvh w-full md:ml-[300px]">
        <TopBar
          song={currentSong}
          onMenuClick={() => setSidebarOpen((o) => !o)}
          onFontIncrease={increaseFontSize}
          onFontDecrease={decreaseFontSize}
        />

        <div className="flex-1 px-4 py-2 pb-4 relative bg-wine-deep md:px-10 md:max-w-[900px] md:mx-auto lg:px-15">
          {currentSong ? (
            <LyricsView
              song={currentSong}
              activeVerseIndex={activeVerseIndex}
              fontSize={fontSize}
            />
          ) : (
            <Welcome />
          )}
        </div>
      </div>
    </div>
  );
}
