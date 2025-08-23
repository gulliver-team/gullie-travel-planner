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

### Phase 3: Backend Integration
- [ ] Vapi phone call setup
- [ ] Exa search integration
- [ ] Vector embedding storage
- [ ] MCP tool creation

### Phase 4: PDF & Email
- [ ] Web worker for PDF generation
- [ ] Resend email integration
- [ ] Document storage in Convex

### Phase 5: Payment & Polish
- [ ] Polar subscription setup
- [ ] Testing & optimization
- [ ] TypeScript compliance

## Key TODOs for You:

### 🔴 Critical Setup Required:
1. **Environment Variables** - Add to `.env.local`:
   ```
   CONVEX_DEPLOYMENT=✅ (configured)
   VAPI_API_KEY=✅ (configured)
   EXA_API_KEY=✅ (configured)
   RESEND_API_KEY=✅ (configured)
   POLAR_API_KEY=✅ (configured)
   OPEN_AI_API=✅ (configured as OPEN_AI_API)
   ```

2. **Vapi Configuration**:
   - ✅ Vapi account created
   - ✅ Assistant ID configured: 840687a8-bf27-4eee-b392-e8ddde8f2dae
   - 🔄 **IMPORTANT**: Run tool registration script to add tools to assistant:
     ```bash
     bun run scripts/register-vapi-tools.ts
     ```
   - Configure phone number in Vapi dashboard
   - Configure assistant greeting script

3. **Polar Setup**:
   - Create Polar account
   - Configure £1000/month subscription plan
   - Set up webhook endpoints

4. **Font Installation**:
   - Add Distek Mono font files to `/public/fonts/`
   - Or configure Google Fonts if available

### 🟡 Configuration Decisions:
1. Which LLM provider for Vercel AI SDK? (OpenAI/Anthropic/etc)
2. Preferred PDF library? (jsPDF, react-pdf, puppeteer)
3. Vapi assistant configuration details
4. Specific visa types to prioritize

### 🟢 Optional Enhancements:
1. Analytics tracking
2. Error monitoring (Sentry)
3. Rate limiting strategy
4. Caching strategy for Exa results

## Vapi Tools Documentation

### Available Tools for Voice Assistant

All tools are exposed via HTTP endpoints at `https://impartial-ladybug-267.convex.site/tools/`

1. **search_relocation_options** - Main search tool for visa/relocation options
   - Parameters: origin_city, origin_country, destination_city, destination_country
   - Returns: 4 visa options (budget, express, balanced, premium)

2. **get_visa_requirements** - Detailed visa requirements lookup
   - Parameters: origin_country, destination_country, visa_type (tourist/work/student/business)
   - Returns: Specific requirements, documents, processing times

3. **estimate_relocation_costs** - Cost breakdown calculator
   - Parameters: destination_city, include_flight, include_housing, include_moving, family_size
   - Returns: Detailed cost estimates

4. **get_document_details** - Document requirement details
   - Parameters: document_type, country
   - Returns: Specific document requirements and processes

5. **capture_contact_info** - Store user contact for follow-up
   - Parameters: email, phone, name
   - Returns: Confirmation message

6. **send_pdf_report** - Generate and email comprehensive PDF report
   - Parameters: email, consultation_data
   - Returns: Email confirmation

7. **confirm_visa_options** - Handle user choice (email vs discuss)
   - Parameters: user_choice, email, name, search_data, location details
   - Returns: Appropriate response based on choice

### Tool Registration
Run `bun run scripts/register-vapi-tools.ts` to register all tools with Vapi assistant.

### Notes on Implementation
- CORS headers disabled in convex/http.ts as requested
- All tools follow Vapi's expected request/response format
- Tool responses use toolCallId for proper correlation
- Error handling returns friendly messages

## Unused Files (Can be deleted)
- `src/components/VapiExample.tsx` - Demo component not used in production
- `src/components/DecryptedTextDemo.tsx` - Demo component not used in production