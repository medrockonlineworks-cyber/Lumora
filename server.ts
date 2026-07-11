import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? Number(process.env.PORT || 3000) : 3001;

app.use(cors());
app.use(express.json());

// Lazy-initialization of Gemini API client
let ai: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('[AI Studio] GEMINI_API_KEY environment variable is not defined. Falling back to local offline stubs.');
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// Financial assistant chat route
app.post('/api/chat', async (req, res) => {
  const { message, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const client = getGeminiClient();

  if (!client) {
    // If API key is missing, let the frontend use local fallback or return a clear notice
    return res.status(503).json({ error: 'Gemini API key not configured' });
  }

  try {
    const systemInstruction = `You are LUMORA Financial Intelligence, a sophisticated AI assistant for Ethiopia's premier investment platform.
We support secure fixed-income plans synced with Commercial Bank of Ethiopia (CBE) transaction records.
Official CBE Banking Details:
- Account Holder: Leykun
- Account Number: 1000419524747
Rules:
- Minimum deposit is now 1,000 ETB.
- Minimum withdrawal limit is 250 ETB.
- Activation bonuses: Starter Level 1 is 50 ETB, Starter Level 2 is 100 ETB, Starter Level 3 is 150 ETB.
- Accounts are registered using CBE-registered phone numbers.
- National ID verification (KYC) is only required for VIP Premium tiers, NOT Starter plans.
- Provide crisp, clear, encouraging, and supportive answers. Talk in ${language === 'am' ? 'Amharic' : 'English'} depending on the user's current choice. Keep answers concise.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text || 'Thank you for your message.' });
  } catch (err: any) {
    console.error('Error in Gemini API Proxy:', err);
    return res.status(500).json({ error: 'Failed to process chat query with Gemini API' });
  }
});

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Plans Endpoint
app.get('/api/plans', (_req, res) => {
  res.json([
    { level: 0, name: 'Starter Level 1', requiredInvestment: 1000, dailyRate: 0.035, durationDays: 50, activationBonus: 50, isVip: false },
    { level: 1, name: 'Starter Level 2', requiredInvestment: 2000, dailyRate: 0.04, durationDays: 60, activationBonus: 100, isVip: false },
    { level: 2, name: 'Starter Level 3', requiredInvestment: 3500, dailyRate: 0.045, durationDays: 70, activationBonus: 150, isVip: false },
    { level: 3, name: 'VIP Level 1', requiredInvestment: 5000, dailyRate: 0.05, durationDays: 90, activationBonus: 250, isVip: true },
    { level: 4, name: 'VIP Level 2', requiredInvestment: 10000, dailyRate: 0.055, durationDays: 120, activationBonus: 500, isVip: true },
    { level: 5, name: 'VIP Level 3', requiredInvestment: 20000, dailyRate: 0.06, durationDays: 150, activationBonus: 1000, isVip: true },
    { level: 6, name: 'VIP Level 4', requiredInvestment: 40000, dailyRate: 0.065, durationDays: 180, activationBonus: 2500, isVip: true },
    { level: 7, name: 'VIP Level 5', requiredInvestment: 80000, dailyRate: 0.07, durationDays: 240, activationBonus: 5500, isVip: true },
  ]);
});

// Dashboard Mock Endpoint
app.get('/api/dashboard/:userId', (req, res) => {
  res.json({
    success: true,
    userId: req.params.userId,
    profile: {
      name: "CBE Verified User",
      phone: "0911000000",
      walletBalance: 1000,
      totalEarned: 100,
      idVerificationStatus: "verified",
      vipLevel: 0
    },
    investments: [],
    transactions: [],
    referrals: []
  });
});

// Withdrawals Mock Endpoint
app.get('/api/withdrawals/user/:userId', (_req, res) => {
  res.json([]);
});

// Deposits Mock Endpoint
app.get('/api/deposits/user/:userId', (_req, res) => {
  res.json([]);
});

// Serve static assets from dist/ in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// For SPA routing fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LUMORA Server] Running on http://0.0.0.0:${PORT}`);
});
