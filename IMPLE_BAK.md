# Implementation Plan - Gullie Global Mobility Expert

## Architecture Overview

### Core Components

1. **Frontend (Next.js + Vercel AI SDK)**

   - Single page app with streaming UI
   - Dark theme with Distek Mono font
   - Real-time search results display
   - Card-based results presentation

2. **Backend Services**

   - **Convex**: Database for users, cities, documents, vector embeddings
   - **Vapi**: Voice AI for phone support
   - **Exa API**: Web search for visa/relocation info
   - **MCP (Model Context Protocol)**: Tool orchestration
   - **Resend**: Email delivery
   - **Polar**: Subscription billing

3. **AI Agents**
   - Mobility Expert Agent (main conversational AI)
   - Search Agent (Exa integration)
   - Document Generator Agent (PDF creation)

## Implementation Phases

### Phase 1: Foundation Setup ✅

- [x] Project structure
- [x] Convex schemas for city data
- [ ] Environment variables setup
- [ ] Dark theme configuration

### Phase 2: Frontend Development

- [ ] Landing page with value proposition
- [ ] User name input field
- [ ] Streaming UI for search results
- [ ] Card components for solutions
- [ ] Email/phone capture modal

## Detailed Implementation Plan

This is how we plan to do it in details:

1. When users are moving countries, they need to consider each country's visa options based on where they are coming from, the cost of types of visa, the complexity of preparation and the timeline

2. When user are moving, they also need to consider flight ticket, housing options, moving services (include furniture and moving cost) and school enrollment if they have kids

3. User can ask further on each visa type, given the answer the AI agent will use Exa search to find out what are the requirements for each specific visa type, answer it to user and then it can give estimate on how long it might take for the user to prepare and what type of documents are required.

4. If user ask for a specific documents it will also answer on the detailed requirement on what should be included in that document.

5. Restrict the LLM to only answer questions related to global mobility and relocation, any questions not related to global mobility and relocation will get an answer like "I am sorry I can only answer questions related to global relocation, is there any specific question related to this topic i can help you with?"

6. As soon as user tell us which city, country they are moving to and which city, country they are from, we will run simulation/search query with `https://docs.exa.ai/reference/getting-started`'s endpoint based on four directions: cheapest, fastest, most expensive and most convenient.

7. To improve latency, we won't be telling user all of these information at once, but we will have the searched results in advance, saved on database as vector embedding (convex), and when user asked for a specific question, we first search for database for this answer, and then we fallback to use Exa to search again. And when user asked for specific details, we will be telling them an estimate on the cost based on our saved results.

8. We will only display the solution as cards, cover the pricing on frontend, when user click on it we will prompt them for email and phone numbers, inform them we will send the consulting results as a comprehensive PDF file to their email once they confirm it

9. Create a web worker to generate PDF file for the user, unhide the pricing, save it to convex's document (this schema don't exists yet) and also send this PDF file to user's email using resend.

10. We will use Polar to charge users, the pricing plan is £1000 a month, and we will continue to support users until their visa process is completed. If user land their visa within a month, we don't charge anything because we will only charge at the end of the month (like a month free trial) - but user will always be able to call us any time

11. Please explain the details and value propositions clear on the landing page - but keep the call to action, input field apparent too

## Initial Setup Notes

- Initially, our frontend only take one value, their name and we will start with greeting them with a question.

- The first sentence for the AI agent on this phone call should be "Hi {{user_name}} this is Gullie Agent, which city you are considering relocation today?"

- We will start with frontend implementation first because we will spend more time tweaking backend. We don't need a lot of pages but just one.

- When the results are not coming in yet, please have the streamed search results display on `app/page.tsx`'s frontend just so users don't wait.

- Create different AI agents, tool calls, use model context protocol wherever you see fit, but also let me know the architecture and write the plan as you go so i can watch as we go.

- Feel free to ask me any questions you are unclear about or feel dangerous to implement.

TODO:
🔴 TODO Items for You:

1. Environment Variables - Copy .env.local.example to .env.local and add:


    - Convex deployment URL
    - Vapi keys and assistant ID
    - OpenAI API key
    - Exa API key
    - Resend API key
    - Polar access tokens

2. Font Files - Add Distek Mono font files to /public/fonts/:


    - Disket-Mono-Regular.ttf
    - Disket-Mono-Bold.ttf

3. Vapi Assistant - Configure in dashboard with greeting:
   "Hi {{user_name}} this is Gullie Agent, which city are you considering relocation today?"
4. Polar Product - Create £1000/month subscription plan
5. Resend Domain - Verify your sending domain

📝 Key Features Implemented:

- Streaming search results display while user speaks
- Four pricing tiers: Cheapest, Fastest, Convenient, Premium
- Blurred pricing until email/phone captured
- PDF generation with comprehensive report
- Email delivery with attachment
- Phone support via Vapi
- Dark electric theme with transform animations
