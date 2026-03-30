import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MassList() {
  const [masses, setMasses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMasses = async (q = '') => {
    setLoading(true);
    const url = q ? `/api/masses?search=${encodeURIComponent(q)}` : '/api/masses';
    const res = await fetch(url);
    setMasses(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchMasses(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMasses(search);
  };

  const handleActivate = async (id) => {
    await fetch(`/api/masses/${id}/activate`, { method: 'POST' });
    fetchMasses(search);
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta misa?')) return;
    await fetch(`/api/masses/${id}`, { method: 'DELETE' });
    fetchMasses(search);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-400">Misas</h2>
        <Link
          to="/admin/masses/new"
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nueva Misa
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por fecha o nombre..."
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
      ) : masses.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No hay misas registradas.</p>
      ) : (
        <div className="space-y-3">
          {masses.map((m) => (
            <div
              key={m.id}
              className={`bg-gray-900 rounded-xl p-4 flex items-center justify-between ${
                m.active ? 'border-2 border-green-500' : 'border border-gray-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-amber-300 font-semibold capitalize">{formatDate(m.date)}</p>
                  {m.active ? (
                    <span className="bg-green-700 text-green-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      EN INICIO
                    </span>
                  ) : null}
                </div>
                {m.name && <p className="text-gray-400 text-sm mt-1">{m.name}</p>}
                <p className="text-gray-600 text-xs mt-1">{m.songCount} canto(s)</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {!m.active && (
                  <button
                    onClick={() => handleActivate(m.id)}
                    className="bg-green-800 hover:bg-green-700 text-green-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Mostrar en inicio
                  </button>
                )}
                <a
                  href={`/?mass=${m.id}`}
                  className="bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Karaoke
                </a>
                <Link
                  to={`/admin/masses/${m.id}/edit`}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(m.id)}
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
