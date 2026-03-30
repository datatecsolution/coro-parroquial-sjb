import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SongList() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSongs = async (q = '') => {
    setLoading(true);
    const url = q ? `/api/songs?search=${encodeURIComponent(q)}` : '/api/songs';
    const res = await fetch(url);
    setSongs(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchSongs(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSongs(search);
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este canto? Se quitará de todas las misas.')) return;
    await fetch(`/api/songs/${id}`, { method: 'DELETE' });
    fetchSongs(search);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-400">Catálogo de Cantos</h2>
        <Link
          to="/admin/songs/new"
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Canto
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, autor o sección..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Buscar
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Cargando...</p>
      ) : songs.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No hay cantos en el catálogo.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {songs.map((s) => (
            <div
              key={s.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-amber-300 font-semibold">{s.title}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {s.section}{s.key ? ` | ${s.key}` : ''}
                  {s.author ? ` | ${s.author}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/songs/${s.id}/edit`}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="bg-red-900 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
