
import { Note } from '../types';

const STORAGE_KEY = 'lumina_notes_data';

export const storageService = {
  getNotes: (): Note[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load notes from storage:', error);
      return [];
    }
  },

  saveNotes: (notes: Note[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes to storage:', error);
    }
  },

  exportData: (notes: Note[]) => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};
