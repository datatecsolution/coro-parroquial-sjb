import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import MassList from './MassList';
import MassForm from './MassForm';
import SongList from './SongList';
import SongForm from './SongForm';

export default function AdminApp() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top nav */}
      <nav className="bg-gray-900 border-b border-amber-900/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 text-xl">&#10013;</span>
            <h1 className="font-bold text-amber-400 text-lg tracking-wide">Admin Panel</h1>
          </div>
          <div className="flex gap-1">
            <NavLink
              to="/admin/masses"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-amber-600 text-white' : 'text-amber-300 hover:bg-gray-800'
                }`
              }
            >
              Misas
            </NavLink>
            <NavLink
              to="/admin/songs"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-amber-600 text-white' : 'text-amber-300 hover:bg-gray-800'
                }`
              }
            >
              Cantos
            </NavLink>
            <a
              href="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-green-400 hover:bg-gray-800 transition-colors"
            >
              Karaoke
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route index element={<Navigate to="masses" replace />} />
          <Route path="masses" element={<MassList />} />
          <Route path="masses/new" element={<MassForm />} />
          <Route path="masses/:id/edit" element={<MassForm />} />
          <Route path="songs" element={<SongList />} />
          <Route path="songs/new" element={<SongForm />} />
          <Route path="songs/:id/edit" element={<SongForm />} />
        </Routes>
      </div>
    </div>
  );
}
