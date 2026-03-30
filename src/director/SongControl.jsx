import React, { memo } from 'react';

function SongControl({ songs, songIndex, verseIndex, onSelectSong, onSelectVerse }) {
  const currentSong = songs[songIndex];

  return (
    <div className="space-y-4">
      {/* Song selector */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Canto</label>
        <div className="space-y-1">
          {songs.map((song, i) => (
            <button
              key={i}
              onClick={() => onSelectSong(i)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                i === songIndex
                  ? 'bg-amber-600/20 border border-amber-500/50 text-amber-200'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent'
              }`}
            >
              <span className="text-amber-500 font-mono text-xs mr-2">{i + 1}</span>
              <span className="font-medium text-sm">{song.title}</span>
              <span className="text-gray-500 text-xs ml-2">{song.section}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verse selector */}
      {currentSong && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Estrofas — {currentSong.title}
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => onSelectVerse(Math.max(0, verseIndex - 1))}
                disabled={verseIndex <= 0}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200 w-10 h-10 rounded-lg text-lg font-bold transition-colors"
              >
                &#9650;
              </button>
              <button
                onClick={() => onSelectVerse(Math.min(currentSong.verses.length - 1, verseIndex + 1))}
                disabled={verseIndex >= currentSong.verses.length - 1}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200 w-10 h-10 rounded-lg text-lg font-bold transition-colors"
              >
                &#9660;
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {currentSong.verses.map((verse, vi) => {
              const preview = verse.lines.slice(0, 2).map(l => l.text).join(' / ');
              return (
                <button
                  key={vi}
                  onClick={() => onSelectVerse(vi)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    vi === verseIndex
                      ? 'bg-green-700/30 border border-green-500/50 text-green-200'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <span className="text-xs font-medium block">
                    {verse.label || `Sección ${vi + 1}`}
                  </span>
                  <span className="text-xs opacity-60 block mt-0.5 truncate">
                    {preview}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(SongControl);
