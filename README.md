# Gullie - Voice-Powered Relocation Planning

> Built in 24 hours at YC Office with the team.

## What We Built

Relocation is stressful. You have to figure out visas, housing, costs, timelines - it's overwhelming. We built Gullie to be the voice you can talk to when you're feeling lost in the process.

**Gullie is a voice AI that helps you plan relocations.** Instead of spending hours googling and stressing, you just talk to it. It understands your situation, gives you realistic scenarios, and helps you make decisions.

## How It Works

1. **Talk to Gullie** - Start a voice conversation (web or phone)
2. **Share your situation** - Where you're moving from/to, budget, timeline
3. **Get 4 scenarios** - Budget, balanced, fast-track, and luxury options
4. **Review your plan** - (next in plan) PDF report and email summary with next steps

## What We Actually Built

### Voice Interface

- Voice conversations using Vapi.ai
- Phone call support (because sometimes you just want to talk)
- Real-time conversation tracking

### Relocation Engine

- Simulated relocation scenarios using GPT-4
- Cost estimates and timeline breakdowns
- 4 different approaches (cheapest, balanced, fastest, luxury)

### Real-Time Features

- Live simulation results as you talk
- Progress tracking across sessions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (real-time database), OpenAI API
- **Voice**: Vapi.ai for phone/web calls
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with custom animations

## Why This Matters

People miss opportunities because relocation seems impossible. We're making it approachable by giving you a voice to talk to instead of endless forms and research.

The voice-first approach is key - when you're stressed about moving to another country, typing into a form feels cold. Talking to someone (even an AI) feels more human.

## What's Next

We're working on:

- Better PDF generation
- Faster voice response times and accurate, uninterrupted tool calls
- Real-time web search power by [Exa](https://exa.ai)
- More detailed cost breakdowns
- Integration with actual relocation services

## Try It

1. Visit the site
2. Start talking to Gullie
3. Tell it where you want to move
4. Get your personalized relocation plan

---

_Built in a YC hackathon because relocation shouldn't be this hard._
