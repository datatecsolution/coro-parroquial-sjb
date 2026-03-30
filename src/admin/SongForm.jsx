import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function emptyVerse() {
  return { label: '', lines: [{ text: '', chorus: false }] };
}

export default function SongForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [songKey, setSongKey] = useState('');
  const [section, setSection] = useState('');
  const [verses, setVerses] = useState([emptyVerse()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/songs/${id}`)
        .then(r => r.json())
        .then(song => {
          setTitle(song.title);
          setAuthor(song.author || '');
          setSongKey(song.key || '');
          setSection(song.section || '');
          setVerses(song.verses.length > 0 ? song.verses : [emptyVerse()]);
        });
    }
  }, [id, isEdit]);

  // Verse operations
  const addVerse = () => setVerses([...verses, emptyVerse()]);

  const removeVerse = (vi) => {
    if (verses.length <= 1) return;
    setVerses(verses.filter((_, i) => i !== vi));
  };

  const updateVerseLabel = (vi, label) => {
    const v = [...verses];
    v[vi] = { ...v[vi], label };
    setVerses(v);
  };

  // Line operations
  const addLine = (vi) => {
    const v = [...verses];
    v[vi] = { ...v[vi], lines: [...v[vi].lines, { text: '', chorus: false }] };
    setVerses(v);
  };

  const removeLine = (vi, li) => {
    const v = [...verses];
    if (v[vi].lines.length <= 1) return;
    v[vi] = { ...v[vi], lines: v[vi].lines.filter((_, i) => i !== li) };
    setVerses(v);
  };

  const updateLine = (vi, li, field, value) => {
    const v = [...verses];
    const lines = [...v[vi].lines];
    lines[li] = { ...lines[li], [field]: value };
    v[vi] = { ...v[vi], lines };
    setVerses(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('El título es requerido'); return; }

    // Clean empty lines
    const cleanVerses = verses.map(v => ({
      ...v,
      lines: v.lines.filter(l => l.text.trim() !== '')
    })).filter(v => v.lines.length > 0);

    if (cleanVerses.length === 0) { setError('Agrega al menos una línea'); return; }

    setSaving(true);
    setError('');

    const body = { title: title.trim(), author, key: songKey, section, verses: cleanVerses };
    const url = isEdit ? `/api/songs/${id}` : '/api/songs';
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

    navigate('/admin/songs');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-amber-400 mb-6">
        {isEdit ? 'Editar Canto' : 'Nuevo Canto'}
      </h2>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del canto"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Autor</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Compositor"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tonalidad</label>
            <input
              type="text"
              value={songKey}
              onChange={(e) => setSongKey(e.target.value)}
              placeholder="Ej: Mi m, Do M"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sección</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Ej: Entrada, Ofertorio, Comunión"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Verses editor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">Versos y letras</label>
            <button
              type="button"
              onClick={addVerse}
              className="text-amber-400 hover:text-amber-300 text-sm font-medium"
            >
              + Agregar verso
            </button>
          </div>

          <div className="space-y-4">
            {verses.map((verse, vi) => (
              <div key={vi} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={verse.label}
                    onChange={(e) => updateVerseLabel(vi, e.target.value)}
                    placeholder="Etiqueta (Estrofa 1, Coro, etc.)"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-amber-300 placeholder-gray-600 focus:outline-none focus:border-amber-500 w-64"
                  />
                  <button
                    type="button"
                    onClick={() => removeVerse(vi)}
                    disabled={verses.length <= 1}
                    className="text-red-400 hover:text-red-300 text-xs disabled:opacity-30"
                  >
                    Eliminar verso
                  </button>
                </div>

                <div className="space-y-2">
                  {verse.lines.map((line, li) => (
                    <div key={li} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={line.text}
                        onChange={(e) => updateLine(vi, li, 'text', e.target.value)}
                        placeholder="Línea de letra..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500"
                      />
                      <label className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap cursor-pointer">
                        <input
                          type="checkbox"
                          checked={line.chorus}
                          onChange={(e) => updateLine(vi, li, 'chorus', e.target.checked)}
                          className="accent-amber-500"
                        />
                        Coro
                      </label>
                      <button
                        type="button"
                        onClick={() => removeLine(vi, li)}
                        disabled={verse.lines.length <= 1}
                        className="text-red-400 hover:text-red-300 text-sm disabled:opacity-30 px-1"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addLine(vi)}
                  className="mt-2 text-gray-500 hover:text-gray-300 text-xs"
                >
                  + Agregar línea
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Canto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/songs')}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
