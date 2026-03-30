import React, { memo } from 'react';

const modes = [
  { key: 'song', label: 'Cantos', icon: '♫' },
  { key: 'blank', label: 'Blanco', icon: '◻' },
  { key: 'text', label: 'Texto', icon: 'Aa' },
  { key: 'image', label: 'Imagen', icon: '🖼' },
];

function ModeButtons({ currentMode, onSelectMode }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {modes.map(m => (
        <button
          key={m.key}
          onClick={() => onSelectMode(m.key)}
          className={`py-3 rounded-xl text-center font-medium transition-all ${
            currentMode === m.key
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <span className="block text-xl">{m.icon}</span>
          <span className="block text-xs mt-1">{m.label}</span>
        </button>
      ))}
    </div>
  );
}

export default memo(ModeButtons);
