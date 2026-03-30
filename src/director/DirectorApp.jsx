import React, { useState, useEffect, useCallback } from 'react';
import useSocket from '../hooks/useSocket';
import ModeButtons from './ModeButtons';
import SongControl from './SongControl';

export default function DirectorApp() {
  const { state, connected, send, refreshKey } = useSocket();
  const [songs, setSongs] = useState([]);
  const [massInfo, setMassInfo] = useState(null);
  const [massLoaded, setMassLoaded] = useState(null);
  const [customText, setCustomText] = useState('');
  const [uploads, setUploads] = useState([]);

  // Load active mass on mount
  useEffect(() => {
    fetch('/api/masses/active')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setSongs(data.songs);
          setMassInfo(data.mass);
          setMassLoaded(data.mass.id);
          // Set massId in session if not set
          if (!state?.massId) {
            send('setState', { massId: data.mass.id });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Reload songs if massId changes from another director
  useEffect(() => {
    if (!state?.massId || state.massId === massLoaded) return;
    fetch(`/api/masses/${state.massId}/karaoke`)
      .then(r => r.json())
      .then(data => {
        setSongs(data.songs);
        setMassInfo(data.mass);
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
            setMassInfo(data.mass);
          }
        })
        .catch(() => {});
    }
  }, [refreshKey]);

  // Load uploads for image mode
  useEffect(() => {
    fetch('/api/uploads').then(r => r.json()).then(setUploads).catch(() => {});
  }, []);

  // Sync customText from state
  useEffect(() => {
    if (state?.customText && !customText) setCustomText(state.customText);
  }, [state?.customText]);

  const update = useCallback((payload) => {
    send('setState', payload);
  }, [send]);

  const handleModeChange = useCallback((mode) => {
    update({ mode });
  }, [update]);

  const handleThemeToggle = useCallback(() => {
    update({ theme: state?.theme === 'dark' ? 'light' : 'dark' });
  }, [state?.theme, update]);

  const handleSelectSong = useCallback((songIndex) => {
    update({ mode: 'song', songIndex, verseIndex: 0 });
  }, [update]);

  const handleSelectVerse = useCallback((verseIndex) => {
    update({ mode: 'song', verseIndex });
  }, [update]);

  const handleSendText = useCallback(() => {
    update({ mode: 'text', customText });
  }, [update, customText]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, data: base64 }),
      });
      const { url } = await res.json();
      setUploads(prev => [...prev, { name: file.name, url }]);
      update({ mode: 'image', imageUrl: url });
    };
    reader.readAsDataURL(file);
  }, [update]);

  const handleSelectImage = useCallback((url) => {
    update({ mode: 'image', imageUrl: url });
  }, [update]);

  // Load mass selector
  const [allMasses, setAllMasses] = useState([]);
  const [showMassSelector, setShowMassSelector] = useState(false);

  const loadMassList = useCallback(() => {
    fetch('/api/masses').then(r => r.json()).then(setAllMasses).catch(() => {});
    setShowMassSelector(true);
  }, []);

  const handleSelectMass = useCallback((massId) => {
    fetch(`/api/masses/${massId}/karaoke`)
      .then(r => r.json())
      .then(data => {
        setSongs(data.songs);
        setMassInfo(data.mass);
        setMassLoaded(massId);
        update({ massId, songIndex: 0, verseIndex: 0, mode: 'blank' });
        setShowMassSelector(false);
      });
  }, [update]);

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Conectando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-6">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-amber-900/30 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-amber-500">&#10013;</span>
            <div className="min-w-0">
              <h1 className="font-bold text-amber-400 text-sm truncate">Director</h1>
              <p className="text-gray-500 text-xs truncate">
                {massInfo ? `${massInfo.name || massInfo.date}` : 'Sin misa'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <button
              onClick={handleThemeToggle}
              className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors"
            >
              {state.theme === 'dark' ? '☀ Claro' : '🌙 Oscuro'}
            </button>
            <button
              onClick={loadMassList}
              className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors"
            >
              Misas
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Mass selector modal */}
        {showMassSelector && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-amber-400 font-bold text-sm">Seleccionar Misa</h3>
              <button onClick={() => setShowMassSelector(false)} className="text-gray-500 text-sm">&#10005;</button>
            </div>
            {allMasses.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay misas.</p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {allMasses.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMass(m.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      m.id === massLoaded ? 'bg-amber-600/20 text-amber-300' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {m.name || m.date} <span className="text-gray-500 text-xs">({m.date})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode buttons */}
        <ModeButtons currentMode={state.mode} onSelectMode={handleModeChange} />

        {/* Mode content */}
        {state.mode === 'song' && songs.length > 0 && (
          <SongControl
            songs={songs}
            songIndex={state.songIndex}
            verseIndex={state.verseIndex}
            onSelectSong={handleSelectSong}
            onSelectVerse={handleSelectVerse}
          />
        )}

        {state.mode === 'song' && songs.length === 0 && (
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">No hay misa seleccionada.</p>
            <button
              onClick={loadMassList}
              className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Seleccionar misa
            </button>
          </div>
        )}

        {state.mode === 'blank' && (
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-4xl mb-2">◻</p>
            <p className="text-gray-500 text-sm">Pantalla en blanco</p>
          </div>
        )}

        {state.mode === 'text' && (
          <div className="bg-gray-900 rounded-xl p-4 space-y-3">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder='Escribe una frase, cita bíblica, aviso...'
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSendText}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Proyectar texto
            </button>
          </div>
        )}

        {state.mode === 'image' && (
          <div className="bg-gray-900 rounded-xl p-4 space-y-3">
            <label className="block w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-colors text-center cursor-pointer">
              Subir imagen
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            {uploads.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Galería</p>
                <div className="grid grid-cols-3 gap-2">
                  {uploads.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectImage(img.url)}
                      className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                        state.imageUrl === img.url ? 'border-amber-500' : 'border-transparent hover:border-gray-600'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
