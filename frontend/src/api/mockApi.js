// mockApi.js — simple promise-based fake API used by all screens
const wait = (ms = 500) => new Promise(res => setTimeout(res, ms));

const mock = {
  token: 'mock-token-123',
  user: { username: 'demo_user', id: 1 },
  score: {
    financial_score: 72,
    status: 'Healthy',
    advice: 'Keep tracking expenses. Try to save 10% monthly.'
  },
  forecast: { next_7_days: [120, 90, 100, 110, 95, 130, 105] },
  transactions: [
    { id: 1, category: 'expense', amount: 45.5, description: 'Lunch' },
    { id: 2, category: 'income', amount: 500.0, description: 'Salary' },
    { id: 3, category: 'expense', amount: 20.0, description: 'Taxi' }
  ],
  chatbotReplies: {
    'how am i doing': 'Your financial health is good. Keep going!',
    default: 'Sorry, I do not know that yet. Try "how am i doing".'
  }
};

export default {
  post: async (path, body) => {
    await wait(300);
    // emulate token creation endpoint
    if (path === 'token/') {
      if (body.username && body.password) {
        return { data: { access: mock.token } };
      } else {
        throw new Error('Invalid credentials');
      }
    }
    // register
    if (path === 'register/') {
      return { data: { ok: true } };
    }
    // add transaction
    if (path === 'transactions/') {
      const id = mock.transactions.length + 1;
      const tx = { id, ...body };
      mock.transactions.unshift(tx);
      return { data: tx };
    }
    // chatbot
    if (path === 'chatbot/') {
      const question = (body.question || '').toLowerCase();
      const answer = mock.chatbotReplies[question] || mock.chatbotReplies.default;
      return { data: { answer } };
    }
    return { data: {} };
  },

  get: async (path) => {
    await wait(300);
    if (path === 'score/') return { data: mock.score };
    if (path === 'forecast/') return { data: mock.forecast };
    if (path === 'transactions/') return { data: mock.transactions };
    return { data: {} };
  }
};
