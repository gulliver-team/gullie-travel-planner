#!/usr/bin/env bun

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

interface VapiTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
  server: {
    url: string;
  };
}

const tools: VapiTool[] = [
  {
    type: "function",
    function: {
      name: "search_relocation_options",
      description:
        "Search for visa and relocation options between two countries",
      parameters: {
        type: "object",
        properties: {
          origin_city: {
            type: "string",
            description: "The city of origin",
          },
          origin_country: {
            type: "string",
            description: "The country of origin",
          },
          destination_city: {
            type: "string",
            description: "The destination city",
          },
          destination_country: {
            type: "string",
            description: "The destination country",
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
    },
  },
  {
    type: "function",
    function: {
      name: "get_visa_requirements",
      description: "Get detailed visa requirements for a specific country",
      parameters: {
        type: "object",
        properties: {
          origin_country: {
            type: "string",
            description: "The country of citizenship",
          },
          destination_country: {
            type: "string",
            description: "The country to get visa requirements for",
          },
          visa_type: {
            type: "string",
            description: "Type of visa (tourist, work, student, business)",
            enum: ["tourist", "work", "student", "business"],
          },
        },
        required: ["origin_country", "destination_country", "visa_type"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/get_visa_requirements`,
    },
  },
  {
    type: "function",
    function: {
      name: "estimate_relocation_costs",
      description: "Estimate the costs involved in relocating to a new city",
      parameters: {
        type: "object",
        properties: {
          destination_city: {
            type: "string",
            description: "The destination city for relocation",
          },
          include_flight: {
            type: "boolean",
            description: "Include flight costs in the estimate",
            default: true,
          },
          include_housing: {
            type: "boolean",
            description: "Include housing costs in the estimate",
            default: true,
          },
          include_moving: {
            type: "boolean",
            description: "Include moving/shipping costs in the estimate",
            default: true,
          },
          family_size: {
            type: "number",
            description: "Number of family members relocating",
            default: 1,
          },
        },
        required: ["destination_city"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/estimate_relocation_costs`,
    },
  },
  {
    type: "function",
    function: {
      name: "get_document_details",
      description:
        "Get details about specific documents required for relocation",
      parameters: {
        type: "object",
        properties: {
          document_type: {
            type: "string",
            description:
              "Type of document (passport, visa, birth_certificate, marriage_certificate, bank_statement, employment_letter)",
            enum: [
              "passport",
              "visa",
              "birth_certificate",
              "marriage_certificate",
              "bank_statement",
              "employment_letter",
            ],
          },
          country: {
            type: "string",
            description: "Country for which document details are needed",
          },
        },
        required: ["document_type", "country"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/get_document_details`,
    },
  },
  {
    type: "function",
    function: {
      name: "capture_contact_info",
      description: "Capture user contact information for follow-up",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "User's email address",
          },
          phone: {
            type: "string",
            description: "User's phone number (optional)",
          },
          name: {
            type: "string",
            description: "User's full name",
          },
        },
        required: ["email", "name"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/capture_contact_info`,
    },
  },
  {
    type: "function",
    function: {
      name: "send_pdf_report",
      description: "Send a comprehensive PDF report to the user's email",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "Email address to send the report to",
          },
          consultation_data: {
            type: "object",
            description: "Data from the consultation to include in the report",
            properties: {
              name: { type: "string" },
              originCity: { type: "string" },
              originCountry: { type: "string" },
              destinationCity: { type: "string" },
              destinationCountry: { type: "string" },
              visaOptions: { type: "string" },
            },
          },
        },
        required: ["email", "consultation_data"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/send_pdf_report`,
    },
  },
  {
    type: "function",
    function: {
      name: "confirm_visa_options",
      description:
        "Confirm user's choice about visa options (email or discuss)",
      parameters: {
        type: "object",
        properties: {
          user_choice: {
            type: "string",
            description:
              "User's choice: 'email' for PDF report or 'discuss' for conversation",
            enum: ["email", "discuss"],
          },
          email: {
            type: "string",
            description: "User's email if they chose email option",
          },
          name: {
            type: "string",
            description: "User's name if they chose email option",
          },
          search_data: {
            type: "string",
            description: "Search results data to include in report",
          },
          origin_city: {
            type: "string",
            description: "Origin city",
          },
          origin_country: {
            type: "string",
            description: "Origin country",
          },
          destination_city: {
            type: "string",
            description: "Destination city",
          },
          destination_country: {
            type: "string",
            description: "Destination country",
          },
          storage_id: {
            type: "string",
            description: "Storage ID for any uploaded documents",
          },
        },
        required: ["user_choice"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/confirm_visa_options`,
    },
  },
];

async function createTool(
  tool: VapiTool
): Promise<{ id: string; name: string } | null> {
  try {
    const response = await fetch("https://api.vapi.ai/tool", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify(tool),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to create tool ${tool.function.name}:`, error);
      return null;
    }

    const result = await response.json();
    console.log(`✅ Created tool: ${tool.function.name} (ID: ${result.id})`);
    return { id: result.id, name: tool.function.name };
  } catch (error) {
    console.error(`Error creating tool ${tool.function.name}:`, error);
    return null;
  }
}

async function updateAssistantTools(toolIds: string[]) {
  try {
    const response = await fetch(
      `https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: {
            provider: "openai",
            model: "gpt-4o",
            toolIds: toolIds,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to update assistant:", error);
      return false;
    }

    console.log("✅ Assistant updated with all tools");
    return true;
  } catch (error) {
    console.error("Error updating assistant:", error);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Vapi tool registration...");
  console.log(`📍 Using Convex site URL: ${CONVEX_SITE_URL}`);
  console.log(`🤖 Assistant ID: ${VAPI_ASSISTANT_ID}\n`);

  const createdTools: string[] = [];

  for (const tool of tools) {
    const result = await createTool(tool);
    if (result) {
      createdTools.push(result.id);
    }
  }

  console.log(`\n📝 Created ${createdTools.length}/${tools.length} tools`);

  if (createdTools.length > 0) {
    console.log("\n🔄 Updating assistant with new tools...");
    const success = await updateAssistantTools(createdTools);

    if (success) {
      console.log(
        "\n✨ All tools registered and assistant updated successfully!"
      );
      console.log("\nTool IDs for reference:");
      createdTools.forEach((id) => console.log(`  - ${id}`));
    } else {
      console.log(
        "\n⚠️  Tools created but assistant update failed. Please update manually."
      );
    }
  } else {
    console.log("\n❌ No tools were created. Please check the errors above.");
  }
}

main().catch(console.error);
