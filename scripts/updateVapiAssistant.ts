// Script to update Vapi assistant with custom tools
// Run with: npx tsx scripts/updateVapiAssistant.ts

import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!VAPI_API_KEY || !VAPI_ASSISTANT_ID || !CONVEX_SITE_URL) {
  console.error("Missing required environment variables");
  process.exit(1);
}

// Read system prompt from file
let systemPrompt: string;
const systemPromptPath = join(process.cwd(), "public/SYSTEM.md");

try {
  // Check if file exists first
  const fs = require("fs");
  if (!fs.existsSync(systemPromptPath)) {
    console.error(
      `Error: System prompt file not found at: ${systemPromptPath}`
    );
    process.exit(1);
  }

  systemPrompt = readFileSync(systemPromptPath, "utf-8");

  // Ensure we have a proper string and add debugging
  if (typeof systemPrompt !== "string") {
    console.error("Error: systemPrompt is not a string:", typeof systemPrompt);
    process.exit(1);
  }

  if (systemPrompt.trim().length === 0) {
    console.error("Error: systemPrompt file is empty");
    process.exit(1);
  }

  // Check if the file contains expected content structure
  if (!systemPrompt.includes("Global Mobility Expert Agent Prompt")) {
    console.error(
      "Error: System prompt file doesn't contain expected content structure"
    );
    console.error(
      "Expected to find 'Global Mobility Expert Agent Prompt' in the file"
    );
    process.exit(1);
  }

  // Check for key sections
  const requiredSections = [
    "Core Communication Principle",
    "ONE QUESTION AT A TIME",
    "Response Guidelines",
  ];

  for (const section of requiredSections) {
    if (!systemPrompt.includes(section)) {
      console.error(
        `Error: System prompt missing required section: ${section}`
      );
      process.exit(1);
    }
  }

  console.log(
    "System prompt loaded successfully, length:",
    systemPrompt.length
  );
  console.log("First 100 characters:", systemPrompt.substring(0, 100));
} catch (error) {
  console.error("Error reading system prompt file:", error);
  console.error("File path attempted:", systemPromptPath);
  process.exit(1);
}

const tools = [
  {
    type: "function",
    function: {
      name: "search_relocation_options",
      description:
        "Search for relocation options when user provides origin and destination cities",
      parameters: {
        type: "object",
        properties: {
          origin_city: {
            type: "string",
            description: "The city the user is moving from",
          },
          origin_country: {
            type: "string",
            description: "The country the user is moving from",
          },
          destination_city: {
            type: "string",
            description: "The city the user is moving to",
          },
          destination_country: {
            type: "string",
            description: "The country the user is moving to",
          },
        },
        required: [
          "origin_city",
          "origin_country",
          "destination_city",
          "destination_country",
        ],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/search_relocation_options`,
      timeoutSeconds: 20,
    },
    messages: [
      {
        type: "request-start",
        content:
          "Let me search for the best relocation options from {{origin_city}} to {{destination_city}}. This will take just a moment...",
      },
      {
        type: "request-complete",
        content: "I've found comprehensive relocation options for your move.",
      },
      {
        type: "request-failed",
        content:
          "I'm having trouble searching for relocation options right now. Let me try another approach.",
      },
    ],
  },
  {
    type: "function",
    function: {
      name: "get_visa_requirements",
      description: "Get detailed visa requirements for specific visa types",
      parameters: {
        type: "object",
        properties: {
          origin_country: {
            type: "string",
            description: "Country of origin",
          },
          destination_country: {
            type: "string",
            description: "Destination country",
          },
          visa_type: {
            type: "string",
            description: "Specific visa type (optional)",
          },
        },
        required: ["origin_country", "destination_country"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/get_visa_requirements`,
      timeoutSeconds: 20,
    },
    messages: [
      {
        type: "request-start",
        content: "Looking up visa requirements for {{destination_country}}...",
      },
      {
        type: "request-complete",
        content: "I've retrieved the visa requirements.",
      },
    ],
  },
  {
    type: "function",
    function: {
      name: "estimate_relocation_costs",
      description: "Calculate detailed cost breakdown for relocation",
      parameters: {
        type: "object",
        properties: {
          destination_city: {
            type: "string",
            description: "Destination city",
          },
          include_flight: {
            type: "boolean",
            description: "Include flight costs",
          },
          include_housing: {
            type: "boolean",
            description: "Include housing costs",
          },
          include_moving: {
            type: "boolean",
            description: "Include moving service costs",
          },
          family_size: {
            type: "number",
            description: "Number of people relocating",
          },
        },
        required: ["destination_city"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/estimate_relocation_costs`,
      timeoutSeconds: 20,
    },
    messages: [
      {
        type: "request-start",
        content: "Calculating your relocation costs...",
      },
    ],
  },
  {
    type: "function",
    function: {
      name: "get_document_details",
      description: "Provide detailed document preparation guidance",
      parameters: {
        type: "object",
        properties: {
          document_type: {
            type: "string",
            description: "Type of document",
          },
          country: {
            type: "string",
            description: "Country for which document is needed",
          },
        },
        required: ["document_type", "country"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/get_document_details`,
      timeoutSeconds: 20,
    },
    messages: [
      {
        type: "request-start",
        content: "Looking up document requirements...",
      },
    ],
  },
  {
    type: "function",
    function: {
      name: "capture_contact_info",
      description: "Capture user's email and phone number for sending reports",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "User's email address",
          },
          phone: {
            type: "string",
            description: "User's phone number",
          },
          name: {
            type: "string",
            description: "User's name",
          },
        },
        required: ["email", "name"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/capture_contact_info`,
      timeoutSeconds: 20,
    },
    messages: [
      {
        type: "request-start",
        content: "Saving your contact information...",
      },
    ],
  },
  {
    type: "function",
    function: {
      name: "send_pdf_report",
      description: "Send comprehensive PDF report to user's email",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "Email address to send report to",
          },
          consultation_data: {
            type: "object",
            description: "Consultation data to include in report",
          },
        },
        required: ["email", "consultation_data"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/send_pdf_report`,
      timeoutSeconds: 20,
    },
    messages: [
      {
        type: "request-start",
        content: "Preparing your comprehensive PDF report...",
      },
      {
        type: "request-complete",
        content: "Your detailed relocation report has been sent to your email!",
      },
    ],
  },
  {
    type: "function",
    function: {
      name: "confirm_visa_options",
      description:
        "Confirm whether user wants detailed explanation or PDF report",
      parameters: {
        type: "object",
        properties: {
          send_pdf: {
            type: "boolean",
            description:
              "Whether user wants PDF report instead of voice explanation",
          },
        },
        required: ["send_pdf"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/confirm_visa_options`,
      timeoutSeconds: 20,
    },
  },
];

async function updateAssistant() {
  try {
    console.log("Updating Vapi assistant...");
    console.log("Assistant ID:", VAPI_ASSISTANT_ID);
    console.log("Convex Site URL:", CONVEX_SITE_URL);

    const response = await fetch(
      `https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Gullie - Global Mobility Expert",
          firstMessage:
            "Hi there, I'm Gullie, your global mobility expert. I'm here to help you navigate your international relocation. Could you tell me which country and city you're moving from, and where you're planning to relocate to?",
          model: {
            provider: "openai",
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
            ],
            tools: tools,
            temperature: 0.7,
            maxTokens: 500,
          },
          voice: {
            provider: "vapi",
            voiceId: "Lily",
          },
          serverUrl: `${CONVEX_SITE_URL}/webhooks/vapi`,
          clientMessages: [
            "transcript",
            "tool-calls",
            "speech-update",
            "status-update",
          ],
          serverMessages: [
            "transcript",
            "tool-calls",
            "end-of-call-report",
            "status-update",
          ],
          endCallPhrases: [
            "goodbye",
            "bye",
            "see you later",
            "talk to you later",
          ],
          backgroundSound: "off",
          responseDelaySeconds: 0.4,
          llmRequestDelaySeconds: 0.1,
          numWordsToInterruptAssistant: 2,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update assistant: ${error}`);
    }

    const result = await response.json();
    console.log("✅ Assistant updated successfully!");
    console.log("Assistant ID:", result.id);
    console.log("Tools configured:", result.model.tools.length);
  } catch (error) {
    console.error("❌ Error updating assistant:", error);
    process.exit(1);
  }
}

updateAssistant();
