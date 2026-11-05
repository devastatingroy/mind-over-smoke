const STORAGE_KEY = 'mind_over_smoke_state_v1';

export const getInitialState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse state', e);
    }
  }

  return {
    isEnrolled: true, // Default to true for MVP demo so user can immediately experience the $20 stake
    stakeAmount: 20,
    refundPerDay: 1,
    maxRefund: 14,
    platformFee: 6,
    currentDay: 1,
    completedDays: [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    lastCheckinDate: null,
    totalCravingsIntercepted: 0,
    savedVocab: [],
    // Biological metrics base
    smokePackPrice: 8, // $8 per pack
    cigsPerDay: 15,
    streak: 0
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

