
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import DeleteModal from './components/DeleteModal';
import { Note, AppState, ViewType } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    notes: [],
    selectedNoteId: null,
    searchQuery: '',
    activeTag: null,
    viewType: 'all',
    isSidebarOpen: false,
    isAIProcessing: false,
    deleteConfirmId: null,
  });

  useEffect(() => {
    const loadedNotes = storageService.getNotes();
    setState(prev => ({ ...prev, notes: loadedNotes }));
  }, []);

  useEffect(() => {
    storageService.saveNotes(state.notes);
  }, [state.notes]);

  const filteredNotes = useMemo(() => {
    return state.notes
      .filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                             note.content.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesTag = !state.activeTag || note.tags.includes(state.activeTag);
        const matchesFavorites = state.viewType !== 'favorites' || note.isFavorite;
        return matchesSearch && matchesTag && matchesFavorites;
      });
  }, [state.notes, state.searchQuery, state.activeTag, state.viewType]);

  const pinnedNotes = filteredNotes.filter(n => n.isPinned).sort((a, b) => b.updatedAt - a.updatedAt);
  const regularNotes = filteredNotes.filter(n => !n.isPinned).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      tags: [],
      updatedAt: Date.now(),
      color: '#4F46E5',
      isFavorite: false,
      isPinned: false,
    };
    setState(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      selectedNoteId: newNote.id
    }));
  };

  const handleSaveNote = (updatedNote: Note) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === updatedNote.id ? updatedNote : n)
    }));
  };

  const handleDeleteConfirm = () => {
    if (!state.deleteConfirmId) return;
    const idToDelete = state.deleteConfirmId;
    setState(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== idToDelete),
      selectedNoteId: prev.selectedNoteId === idToDelete ? null : prev.selectedNoteId,
      deleteConfirmId: null
    }));
  };

  const handleToggleFavorite = (id: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)
    }));
  };

  const handleTogglePin = (id: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n)
    }));
  };

  const selectedNote = state.notes.find(n => n.id === state.selectedNoteId) || null;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-indigo-500/30">
      <Sidebar 
        notes={state.notes}
        activeTag={state.activeTag}
        viewType={state.viewType}
        onSelectTag={(tag) => setState(prev => ({ ...prev, activeTag: tag, isSidebarOpen: false }))}
        onSelectView={(view) => setState(prev => ({ ...prev, viewType: view, activeTag: null, isSidebarOpen: false }))}
        isOpen={state.isSidebarOpen}
        onToggle={() => setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))}
        onExport={() => storageService.exportData(state.notes)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {!state.selectedNoteId ? (
          <div className="flex-1 flex flex-col h-full">
            <div className="p-6 md:p-10 sticky top-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-30">
              <div className="max-w-6xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setState(prev => ({ ...prev, isSidebarOpen: true }))} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
                      <i className="fas fa-bars-staggered"></i>
                    </button>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                      {state.activeTag ? `#${state.activeTag}` : state.viewType === 'favorites' ? 'Favorites' : 'My Thoughts'}
                    </h1>
                  </div>
                </div>

                <div className="relative group">
                  <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors"></i>
                  <input
                    type="text"
                    value={state.searchQuery}
                    onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    placeholder="Search through your notes..."
                    className="w-full bg-white/5 border border-white/5 focus:border-indigo-500/30 focus:bg-white/[0.08] outline-none rounded-2xl py-4 pl-14 pr-6 text-base transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32">
              <div className="max-w-6xl mx-auto space-y-12">
                {pinnedNotes.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <i className="fas fa-thumbtack text-indigo-500 text-xs"></i>
                      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Pinned</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pinnedNotes.map(note => (
                        <NoteCard 
                          key={note.id} 
                          note={note} 
                          onClick={() => setState(prev => ({ ...prev, selectedNoteId: note.id }))}
                          onDeleteRequest={(id) => setState(prev => ({ ...prev, deleteConfirmId: id }))}
                          onToggleFavorite={handleToggleFavorite}
                          onTogglePin={handleTogglePin}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <i className="fas fa-layer-group text-gray-600 text-xs"></i>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">
                      {pinnedNotes.length > 0 ? 'Recent' : 'All'}
                    </h2>
                  </div>
                  
                  {regularNotes.length === 0 && pinnedNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 transition-transform duration-500">
                        <i className="fas fa-feather text-4xl text-gray-700"></i>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Empty here</h3>
                      <button onClick={handleCreateNote} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 transition-all">
                        Create Note
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularNotes.map(note => (
                        <NoteCard 
                          key={note.id} 
                          note={note} 
                          onClick={() => setState(prev => ({ ...prev, selectedNoteId: note.id }))}
                          onDeleteRequest={(id) => setState(prev => ({ ...prev, deleteConfirmId: id }))}
                          onToggleFavorite={handleToggleFavorite}
                          onTogglePin={handleTogglePin}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>

            <button onClick={handleCreateNote} className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-110 transition-all z-40 group">
              <i className="fas fa-plus text-2xl text-white group-hover:scale-125 transition-transform"></i>
            </button>
          </div>
        ) : (
          <NoteEditor 
            note={selectedNote}
            onSave={handleSaveNote}
            onClose={() => setState(prev => ({ ...prev, selectedNoteId: null }))}
          />
        )}
      </main>

      {state.deleteConfirmId && (
        <DeleteModal 
          onConfirm={handleDeleteConfirm}
          onCancel={() => setState(prev => ({ ...prev, deleteConfirmId: null }))}
        />
      )}
    </div>
  );
};

export default App;
