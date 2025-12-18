
import React, { useRef } from 'react';
import { Note, ViewType } from '../types';

interface SidebarProps {
  notes: Note[];
  activeTag: string | null;
  viewType: ViewType;
  onSelectTag: (tag: string | null) => void;
  onSelectView: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
  onExport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  notes, 
  activeTag, 
  viewType, 
  onSelectTag, 
  onSelectView, 
  isOpen, 
  onToggle, 
  onExport 
}) => {
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const handleAllNotes = () => {
    onSelectView('all');
    onSelectTag(null);
  };

  const handleFavorites = () => {
    onSelectView('favorites');
    onSelectTag(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 glass border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <i className="fas fa-brain text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Lumina</h1>
            </div>
            <button onClick={onToggle} className="lg:hidden text-gray-400 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-6">
            <div>
              <button 
                onClick={handleAllNotes}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${viewType === 'all' && !activeTag ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
              >
                <i className="fas fa-sticky-note w-5"></i>
                <span className="font-medium">All Notes</span>
              </button>
              <button 
                onClick={handleFavorites}
                className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg transition-all ${viewType === 'favorites' ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
              >
                <i className="fas fa-star w-5"></i>
                <span className="font-medium">Favorites</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Tags</h3>
              <div className="space-y-1">
                {allTags.length === 0 && <p className="text-xs text-gray-600 px-3">No tags yet</p>}
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => onSelectTag(tag)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTag === tag ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                  >
                    <i className="fas fa-hashtag text-xs w-5"></i>
                    <span className="truncate">{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="pt-4 border-t border-white/5">
            <button 
              onClick={onExport}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all"
            >
              <i className="fas fa-download w-5"></i>
              <span className="font-medium">Export Backup</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
