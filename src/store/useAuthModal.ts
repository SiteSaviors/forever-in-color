import { create } from 'zustand';
import type { StartPreviewOptions } from '@/store/founder/storeTypes';
import { emitAuthGateEvent, type AuthProviderMethod } from '@/utils/telemetry';

export type AuthModalMode = 'signin' | 'signup' | 'gate';
export type AuthModalSource = 'preview' | 'pricing' | 'gallery' | 'canvas' | 'nav' | string;
type AuthGateDismissReason = 'dismiss' | 'close';
type AuthGateMethod = AuthProviderMethod;

type StoredGateIntent = {
  styleId: string;
  options: StartPreviewOptions | null;
  source: AuthModalSource | null;
  autoOpen: boolean;
};

const GATE_INTENT_STORAGE_KEY = 'wt_auth_gate_intent_v1';

const readStoredGateIntent = (): StoredGateIntent | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(GATE_INTENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredGateIntent;
    if (!parsed?.styleId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const persistGateIntent = (intent: StoredGateIntent | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (!intent) {
      window.sessionStorage.removeItem(GATE_INTENT_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(GATE_INTENT_STORAGE_KEY, JSON.stringify(intent));
    }
  } catch {
    // Ignore persistence failures (sessionStorage may be unavailable).
  }
};

const resolveSurface = (): 'preview' => 'preview';

type AuthModalState = {
  open: boolean;
  mode: AuthModalMode;
  source: AuthModalSource | null;
  pendingStyleId: string | null;
  pendingAuthOptions: StartPreviewOptions | null;
  gateOpen: boolean;
  openModal: (
    mode?: AuthModalMode,
    payload?: { source?: AuthModalSource; styleId?: string | null; options?: StartPreviewOptions | null }
  ) => void;
  closeModal: () => void;
  setMode: (mode: AuthModalMode) => void;
  registerGateIntent: (payload: {
    styleId: string;
    options?: StartPreviewOptions | null;
    source?: AuthModalSource | null;
    autoOpen?: boolean;
  }) => void;
  clearGateIntent: (reason?: AuthGateDismissReason) => void;
  completeGateIntent: (method: AuthGateMethod) => void;
  consumePendingIntent: () => { styleId: string; options: StartPreviewOptions | null } | null;
};

const initialGateIntent = readStoredGateIntent();
const shouldAutoOpenGate = Boolean(initialGateIntent?.autoOpen);

export const useAuthModal = create<AuthModalState>((set, get) => ({
  open: false,
  mode: shouldAutoOpenGate ? 'gate' : 'signin',
  source: initialGateIntent?.source ?? null,
  pendingStyleId: initialGateIntent?.styleId ?? null,
  pendingAuthOptions: initialGateIntent?.options ?? null,
  gateOpen: shouldAutoOpenGate,
  openModal: (mode = 'signin', payload) => {
    if (mode === 'gate' && payload?.styleId) {
      get().registerGateIntent({
        styleId: payload.styleId,
        options: payload.options ?? null,
        source: payload.source ?? 'preview',
        autoOpen: true,
      });
      return;
    }
    set((state) => {
      return {
        open: true,
        mode,
        source: payload?.source ?? state.source,
      };
    });
  },
  closeModal: () => {
    const state = get();
    if (state.mode === 'gate' && state.gateOpen) {
      state.clearGateIntent('dismiss');
      return;
    }
    set({
      open: false,
      source: null,
    });
  },
  setMode: (mode) => set({ mode }),
  registerGateIntent: ({ styleId, options = null, source = 'preview', autoOpen = true }) => {
    const normalizedOptions = options ?? null;
    const normalizedSource = source ?? 'preview';
    persistGateIntent({
      styleId,
      options: normalizedOptions,
      source: normalizedSource,
      autoOpen,
    });
    set({
      open: false,
      mode: 'gate',
      source: normalizedSource,
      pendingStyleId: styleId,
      pendingAuthOptions: normalizedOptions,
      gateOpen: autoOpen,
    });
    if (autoOpen) {
      emitAuthGateEvent({
        type: 'auth_modal_shown',
        surface: resolveSurface(),
        styleId,
      });
    }
  },
  clearGateIntent: (reason = 'dismiss') => {
    const state = get();
    if (!state.pendingStyleId && !state.gateOpen) {
      set({ open: false, gateOpen: false, mode: state.mode === 'gate' ? 'signin' : state.mode });
      return;
    }
    persistGateIntent(null);
    set({
      open: false,
      gateOpen: false,
      pendingStyleId: null,
      pendingAuthOptions: null,
      source: null,
      mode: 'signin',
    });
    if (state.pendingStyleId) {
      emitAuthGateEvent({ type: 'auth_modal_abandoned', reason });
    }
  },
  completeGateIntent: (method) => {
    const state = get();
    if (!state.pendingStyleId) {
      return;
    }
    emitAuthGateEvent({ type: 'auth_modal_completed', method });
    persistGateIntent({
      styleId: state.pendingStyleId,
      options: state.pendingAuthOptions,
      source: state.source,
      autoOpen: false,
    });
    set({
      gateOpen: false,
      open: false,
      mode: 'signin',
    });
  },
  consumePendingIntent: () => {
    const state = get();
    if (!state.pendingStyleId) {
      return null;
    }
    const intent = {
      styleId: state.pendingStyleId,
      options: state.pendingAuthOptions,
    };
    persistGateIntent(null);
    set({
      pendingStyleId: null,
      pendingAuthOptions: null,
      gateOpen: false,
      open: false,
      source: null,
      mode: 'signin',
    });
    return intent;
  },
}));
