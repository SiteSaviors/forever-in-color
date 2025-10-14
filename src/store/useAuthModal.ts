import { create } from 'zustand';

export type AuthModalMode = 'signin' | 'signup';

type AuthModalState = {
  open: boolean;
  mode: AuthModalMode;
  openModal: (mode?: AuthModalMode) => void;
  closeModal: () => void;
  setMode: (mode: AuthModalMode) => void;
};

export const useAuthModal = create<AuthModalState>((set) => ({
  open: false,
  mode: 'signin',
  openModal: (mode = 'signin') => set({ open: true, mode }),
  closeModal: () => set({ open: false }),
  setMode: (mode) => set({ mode }),
}));
