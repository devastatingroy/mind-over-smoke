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
