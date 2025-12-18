
import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onDeleteRequest: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onDeleteRequest, onToggleFavorite, onTogglePin }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(note.updatedAt);

  const cardStyle = {
    borderColor: note.color ? `${note.color}33` : 'rgba(255,255,255,0.05)',
  };

  return (
    <div 
      onClick={onClick}
      style={cardStyle}
      className="group relative glass p-6 rounded-3xl hover:bg-white/[0.05] border transition-all duration-300 cursor-pointer h-[260px] flex flex-col overflow-hidden"
    >
      {/* Color Accent Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1" 
        style={{ backgroundColor: note.color || '#4F46E5' }}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-8">
          <h3 className="font-black text-xl text-white truncate group-hover:text-indigo-400 transition-colors">
            {note.title || 'Untitled'}
          </h3>
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            {formattedDate}
          </span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${note.isPinned ? 'text-indigo-400 bg-indigo-400/10' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
          >
            <i className={`fas fa-thumbtack text-xs ${note.isPinned ? '' : 'rotate-45'}`}></i>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${note.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
          >
            <i className={`${note.isFavorite ? 'fas' : 'far'} fa-star text-xs`}></i>
          </button>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm line-clamp-4 flex-1 leading-relaxed font-light mb-4">
        {note.content || 'Start writing something amazing...'}
      </p>

      <div className="flex items-center gap-2 mt-auto">
        {note.tags.length > 0 ? (
          note.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-white/5 text-gray-500 text-[9px] font-bold rounded-lg border border-white/5">
              #{tag}
            </span>
          ))
        ) : (
          <div className="h-4" />
        )}
      </div>

      {/* Quick Delete Overlay for Mobile/Hover */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest(note.id);
        }}
        className="absolute bottom-6 right-6 w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-xl shadow-red-500/10 active:scale-90"
        title="Delete Note"
      >
        <i className="fas fa-trash-alt text-sm"></i>
      </button>
    </div>
  );
};

export default NoteCard;
