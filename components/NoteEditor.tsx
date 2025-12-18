
import React, { useState, useEffect, useRef } from 'react';
import { Note, AIServiceTask } from '../types';
import { geminiService } from '../services/geminiService';

interface NoteEditorProps {
  note: Note | null;
  onSave: (updatedNote: Note) => void;
  onClose: () => void;
}

const NOTE_COLORS = [
  '#4F46E5', // Indigo
  '#E11D48', // Rose
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#0891B2', // Cyan
  '#475569', // Slate
];

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState('#4F46E5');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setColor(note.color || '#4F46E5');
    }
  }, [note?.id]);

  // Auto-save logic
  useEffect(() => {
    if (!note) return;
    
    // Don't auto-save if values haven't changed from the initial note state
    if (
      title === note.title && 
      content === note.content && 
      JSON.stringify(tags) === JSON.stringify(note.tags) &&
      color === note.color
    ) {
      return;
    }

    setSaveStatus('saving');
    
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = window.setTimeout(() => {
      onSave({
        ...note,
        title,
        content,
        tags,
        color,
        updatedAt: Date.now(),
      });
      setSaveStatus('saved');
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, content, tags, color]);

  const handleAIAction = async (task: AIServiceTask) => {
    if (!content && task !== AIServiceTask.OCR) return;
    setIsProcessing(true);
    try {
      const result = await geminiService.processNote(task, content, title);
      if (task === AIServiceTask.TAGS) {
        const newTags = result.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '');
        setTags(prev => Array.from(new Set([...prev, ...newTags])));
      } else {
        const appendText = `\n\n--- AI ${task} ---\n${result}`;
        setContent(prev => prev + appendText);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setIsProcessing(true);
      try {
        const text = await geminiService.processNote(AIServiceTask.OCR, '', '', base64);
        setContent(prev => (prev ? prev + '\n' + text : text));
      } catch (error) {
        alert("Image analysis failed.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!note) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] lg:relative lg:inset-auto lg:h-full lg:bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">Note Editor</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium ${saveStatus === 'saving' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {saveStatus === 'saving' ? 'Saving...' : 'All changes saved'}
              </span>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="hidden md:flex items-center gap-1.5 px-4">
          {NOTE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full transition-transform hover:scale-125 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] scale-110' : ''}`}
              title={`Color: ${c}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isProcessing && (
             <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full animate-pulse border border-indigo-500/20">
               <i className="fas fa-sparkles text-xs"></i>
               <span className="text-[10px] font-bold uppercase">AI Processing</span>
             </div>
          )}
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-12 max-w-4xl mx-auto w-full">
        {/* Mobile Color Palette */}
        <div className="flex md:hidden items-center justify-center gap-3 mb-8">
           {NOTE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] scale-110' : ''}`}
            />
          ))}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          style={{ borderLeft: `4px solid ${color}` }}
          className="w-full text-3xl md:text-5xl font-black bg-transparent border-none outline-none placeholder:text-white/10 text-white mb-6 pl-4"
        />
        
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
              #{tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-400">
                <i className="fas fa-times text-[10px]"></i>
              </button>
            </span>
          ))}
          <button 
            onClick={() => handleAIAction(AIServiceTask.TAGS)}
            className="px-2.5 py-1 border border-dashed border-white/10 text-gray-500 hover:text-indigo-400 hover:border-indigo-400/50 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus-circle"></i>
            Auto Tags
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your thoughts here..."
          className="w-full h-full bg-transparent border-none outline-none text-xl text-gray-300 placeholder:text-white/5 resize-none leading-relaxed font-light"
        />
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-[#0d0d0d] border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-safe">
        <button 
          onClick={() => handleAIAction(AIServiceTask.SUMMARIZE)}
          disabled={isProcessing}
          className="flex-shrink-0 px-4 py-2.5 bg-white/5 hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-400 rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center gap-2"
        >
          <i className="fas fa-align-left"></i>
          Summarize
        </button>
        <button 
          onClick={() => handleAIAction(AIServiceTask.REFINE)}
          disabled={isProcessing}
          className="flex-shrink-0 px-4 py-2.5 bg-white/5 hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-400 rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center gap-2"
        >
          <i className="fas fa-wand-magic-sparkles"></i>
          Refine
        </button>
        <button 
          onClick={() => handleAIAction(AIServiceTask.CONTINUE)}
          disabled={isProcessing}
          className="flex-shrink-0 px-4 py-2.5 bg-white/5 hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-400 rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center gap-2"
        >
          <i className="fas fa-pen-nib"></i>
          Continue
        </button>
        <div className="h-6 w-px bg-white/10 mx-1 flex-shrink-0"></div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex-shrink-0 px-4 py-2.5 bg-white/5 hover:bg-amber-600/20 text-gray-300 hover:text-amber-400 rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center gap-2"
        >
          <i className="fas fa-camera"></i>
          OCR Scan
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      </div>
    </div>
  );
};

export default NoteEditor;
