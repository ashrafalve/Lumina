
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: number;
  color: string;
  isFavorite: boolean;
  isPinned: boolean;
}

export interface AppState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  activeTag: string | null;
  isSidebarOpen: boolean;
  isAIProcessing: boolean;
  deleteConfirmId: string | null;
}

export enum AIServiceTask {
  SUMMARIZE = 'SUMMARIZE',
  REFINE = 'REFINE',
  TAGS = 'TAGS',
  OCR = 'OCR',
  CONTINUE = 'CONTINUE'
}
