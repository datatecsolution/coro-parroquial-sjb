import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MassForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/songs').then(r => r.json()).then(setAllSongs);

    if (isEdit) {
      fetch(`/api/masses/${id}`)
        .then(r => r.json())
        .then(mass => {
          setDate(mass.date);
          setName(mass.name || '');
          setSelectedSongIds(mass.songs.map(s => s.id));
        });
    }
  }, [id, isEdit]);

  const addSong = (songId) => {
    if (!selectedSongIds.includes(songId)) {
      setSelectedSongIds([...selectedSongIds, songId]);
    }
  };

  const removeSong = (songId) => {
    setSelectedSongIds(selectedSongIds.filter(id => id !== songId));
  };

  const moveSong = (index, direction) => {
    const newIds = [...selectedSongIds];
    const target = index + direction;
    if (target < 0 || target >= newIds.length) return;
    [newIds[index], newIds[target]] = [newIds[target], newIds[index]];
    setSelectedSongIds(newIds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) { setError('La fecha es requerida'); return; }
    setSaving(true);
    setError('');

    const body = { date, name, songIds: selectedSongIds };
    const url = isEdit ? `/api/masses/${id}` : '/api/masses';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Error al guardar');
      setSaving(false);
      return;
    }

    navigate('/admin/masses');
  };

  const getSongById = (songId) => allSongs.find(s => s.id === songId);
  const availableSongs = allSongs.filter(s => !selectedSongIds.includes(s.id));

  return (
    <div>
      <h2 className="text-2xl font-bold text-amber-400 mb-6">
        {isEdit ? 'Editar Misa' : 'Nueva Misa'}
      </h2>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date & Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre (opcional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Domingo de Ramos, Misa de Gallo"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Song selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Agregar cantos</label>
          <select
            onChange={(e) => { if (e.target.value) { addSong(Number(e.target.value)); e.target.value = ''; }}}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-amber-500"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar canto del catálogo...</option>
            {availableSongs.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} {s.section ? `(${s.section})` : ''} {s.author ? `— ${s.author}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Selected songs list */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cantos de la misa ({selectedSongIds.length})
          </label>
          {selectedSongIds.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">
              No hay cantos seleccionados. Usa el selector de arriba.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedSongIds.map((songId, index) => {
                const song = getSongById(songId);
                if (!song) return null;
                return (
                  <div
                    key={songId}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-amber-600 font-mono text-sm w-6 text-center">{index + 1}</span>
                      <div>
                        <p className="text-gray-100 font-medium text-sm">{song.title}</p>
                        <p className="text-gray-500 text-xs">
                          {song.section}{song.key ? ` | ${song.key}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveSong(index, -1)}
                        disabled={index === 0}
                        className="px-2 py-1 text-gray-400 hover:text-gray-200 disabled:opacity-30 text-sm"
                      >
                        &#9650;
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSong(index, 1)}
                        disabled={index === selectedSongIds.length - 1}
                        className="px-2 py-1 text-gray-400 hover:text-gray-200 disabled:opacity-30 text-sm"
                      >
                        &#9660;
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSong(songId)}
                        className="px-2 py-1 text-red-400 hover:text-red-300 text-sm ml-2"
                      >
                        &#10005;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Misa'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/masses')}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
