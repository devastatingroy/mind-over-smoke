const STORAGE_KEY = 'mind_over_smoke_state_v2';
const LEGACY_STORAGE_KEY = 'mind_over_smoke_state_v1';

export const getInitialState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      console.error('Failed to parse state', e);
    }
  }

  let legacy = null;
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');
  } catch (e) {
    console.error('Failed to parse legacy state', e);
  }

  return {
    challenge: null,
    stakeAmount: 20,
    refundPerDay: 1,
    maxRefund: 14,
    baseServiceFee: 6,
    totalCravingsIntercepted: legacy?.totalCravingsIntercepted || 0,
    savedVocab: Array.isArray(legacy?.savedVocab) ? legacy.savedVocab : [],
    // Biological metrics base
    smokePackPrice: legacy?.smokePackPrice || 8,
    cigsPerDay: legacy?.cigsPerDay || 15,
    streak: legacy?.streak || 0
  };
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

const SESSION_STATE_KEY = 'mind_over_smoke_active_session_v2';

export const getSavedSession = () => {
  try {
    // Clear out deprecated legacy v1 sessions to prevent old question schemas from sticking
    sessionStorage.removeItem('mind_over_smoke_active_session_v1');

    const raw = sessionStorage.getItem(SESSION_STATE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && Array.isArray(session.questions) && session.questions.length > 0) {
      return session;
    }
  } catch (e) {
    console.error('Failed to parse session', e);
  }
  return null;
};

export const saveActiveSession = (sessionData) => {
  try {
    sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.error('Failed to save session', e);
  }
};

export const clearActiveSession = () => {
  try {
    sessionStorage.removeItem(SESSION_STATE_KEY);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
};

