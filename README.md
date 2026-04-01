# AMI Voice Companion

Client demo for an elderly-friendly AI companion with voice input, spoken replies, and short supportive conversations.

## Recommended Demo Stack

- `Next.js` App Router for a fast demo and simple deployment
- `React` for the chat and voice interface
- `Gemini API` through a server-side route for secure prompt handling
- `Web Speech API` for browser speech recognition and text-to-speech
- `Tailwind CSS v4` plus custom CSS for quick visual polish
- `Vercel` for the easiest demo deployment

## Features

- Warm starter greeting
- Short, elderly-friendly responses
- English or Chinese replies based on user language
- Voice input support in supported browsers
- Spoken assistant replies
- Prompt guardrails for health-sensitive conversations

## Local Setup

1. Copy `.env.example` to `.env.local`
2. Add your Gemini API key:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

3. Install dependencies and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Shape

The app sends this payload to `/api/chat`:

```json
{
  "message": "User spoken text here",
  "history": [
    { "role": "assistant", "text": "Hello Gautam. How are you feeling today?" },
    { "role": "user", "text": "I am fine." }
  ]
}
```

Only the last few messages are forwarded to keep responses fast and low-cost.

## Remaining Nice-to-Have Upgrades

- Save conversation summaries for family or caregiver dashboards
- Add larger accessibility controls for text size and contrast
- Add daily reminder cards for water, meals, and walks
- Add persistent language and voice preferences
- Add analytics for demo usage and conversation success rate
