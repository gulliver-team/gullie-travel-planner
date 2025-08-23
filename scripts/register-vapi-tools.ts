#!/usr/bin/env bun

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
const CONVEX_SITE_URL = "https://impartial-ladybug-267.convex.site";

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

interface ExistingTool extends VapiTool {
  id: string;
  createdAt: string;
  updatedAt: string;
  orgId: string;
}

const tools: VapiTool[] = [
  {
    type: "function",
    function: {
      name: "run_simulation",
      description:
        "Populate and trigger the local simulations run with collected relocation inputs.",
      parameters: {
        type: "object",
        properties: {
          start_city: { type: "string", description: "Origin city (e.g., 'San Francisco, CA, USA')" },
          destination_city: { type: "string", description: "Destination city (e.g., 'Lisbon, Portugal')" },
          budget_min: { type: "number", description: "Minimum budget in USD" },
          budget_max: { type: "number", description: "Maximum budget in USD" },
          move_month: { type: "string", description: "Ideal move month in YYYY-MM" },
          context: { type: "string", description: "Additional context and constraints" },
        },
        required: ["start_city", "destination_city"],
      },
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/run_simulation`,
    },
  },
  {
    type: "function",
    function: {
      name: "search_relocation_options",
      description: "Search for visa and relocation options between two countries. Returns 4 options: budget, express, balanced, and premium relocation plans with costs and timelines.",
      parameters: {
        type: "object",
        properties: {
          origin_city: {
            type: "string",
            description: "The city of origin (e.g., 'London', 'New York', 'Mumbai')"
          },
          origin_country: {
            type: "string",
            description: "The country of origin (e.g., 'United Kingdom', 'USA', 'India')"
          },
          destination_city: {
            type: "string",
            description: "The destination city (e.g., 'San Francisco', 'Toronto', 'Berlin')"
          },
          destination_country: {
            type: "string",
            description: "The destination country (e.g., 'United States', 'Canada', 'Germany')"
          }
        },
        required: ["origin_city", "origin_country", "destination_city", "destination_country"]
      }
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/search_relocation_options`
    }
  },
  {
    type: "function",
    function: {
      name: "get_visa_requirements",
      description: "Get detailed visa requirements for a specific country pair and visa type. Returns processing times, costs, required documents, and application procedures.",
      parameters: {
        type: "object",
        properties: {
          origin_country: {
            type: "string",
            description: "The country of citizenship or passport country (e.g., 'United Kingdom', 'USA', 'India')"
          },
          destination_country: {
            type: "string",
            description: "The destination country where visa is needed (e.g., 'United States', 'Canada', 'Germany')"
          },
          visa_type: {
            type: "string",
            description: "Type of visa being applied for",
            enum: ["tourist", "work", "student", "business"]
          }
        },
        required: ["origin_country", "destination_country", "visa_type"]
      }
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/get_visa_requirements`
    }
  },
  {
    type: "function",
    function: {
      name: "estimate_relocation_costs",
      description: "Calculate detailed cost estimates for relocating to a new city, including flights, housing, moving expenses, and initial setup costs.",
      parameters: {
        type: "object",
        properties: {
          destination_city: {
            type: "string",
            description: "The destination city for relocation (e.g., 'London', 'New York', 'Singapore')"
          },
          include_flight: {
            type: "boolean",
            description: "Include flight costs in the estimate",
            default: true
          },
          include_housing: {
            type: "boolean",
            description: "Include housing costs in the estimate",
            default: true
          },
          include_moving: {
            type: "boolean",
            description: "Include moving/shipping costs in the estimate",
            default: true
          },
          family_size: {
            type: "number",
            description: "Number of family members relocating",
            default: 1
          }
        },
        required: ["destination_city"]
      }
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/estimate_relocation_costs`
    }
  },
  {
    type: "function",
    function: {
      name: "get_document_details",
      description: "Get detailed information about specific documents required for relocation, including how to obtain them, processing times, and validity periods.",
      parameters: {
        type: "object",
        properties: {
          document_type: {
            type: "string",
            description: "Type of document needed for relocation",
            enum: ["passport", "visa", "birth_certificate", "marriage_certificate", "bank_statement", "employment_letter"]
          },
          country: {
            type: "string",
            description: "Country for which document details are needed (e.g., 'United States', 'Canada', 'United Kingdom')"
          }
        },
        required: ["document_type", "country"]
      }
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/get_document_details`
    }
  },
  {
    type: "function",
    function: {
      name: "capture_contact_info",
      description: "Save user contact information for follow-up and sending detailed reports. This allows us to provide personalized assistance.",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "User's email address for sending reports"
          },
          phone: {
            type: "string",
            description: "User's phone number for follow-up calls (optional)"
          },
          name: {
            type: "string",
            description: "User's full name for personalization"
          }
        },
        required: ["email", "name"]
      }
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/capture_contact_info`
    }
  },
  {
    type: "function",
    function: {
      name: "send_pdf_report",
      description: "Generate and send a comprehensive PDF report to the user's email with detailed visa requirements, cost breakdowns, and step-by-step relocation guide.",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "Email address to send the PDF report to"
          },
          consultation_data: {
            type: "object",
            description: "Consultation data to include in the PDF report",
            properties: {
              name: { 
                type: "string",
                description: "User's name"
              },
              originCity: { 
                type: "string",
                description: "City of origin"
              },
              originCountry: { 
                type: "string",
                description: "Country of origin"
              },
              destinationCity: { 
                type: "string",
                description: "Destination city"
              },
              destinationCountry: { 
                type: "string",
                description: "Destination country"
              },
              visaOptions: { 
                type: "string",
                description: "Visa options and recommendations"
              }
            }
          }
        },
        required: ["email", "consultation_data"]
      }
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/send_pdf_report`
    }
  },
  {
    type: "function",
    function: {
      name: "confirm_visa_options",
      description: "Handle user's preference to either receive a detailed PDF report via email or discuss visa options in the current conversation.",
      parameters: {
        type: "object",
        properties: {
          user_choice: {
            type: "string",
            description: "User's preference for receiving information",
            enum: ["email", "discuss"]
          },
          email: {
            type: "string",
            description: "User's email address if they chose to receive PDF report"
          },
          name: {
            type: "string",
            description: "User's name if they chose to receive PDF report"
          },
          search_data: {
            type: "string",
            description: "Search results and visa options to include in the report"
          },
          origin_city: {
            type: "string",
            description: "Origin city from the search"
          },
          origin_country: {
            type: "string",
            description: "Origin country from the search"
          },
          destination_city: {
            type: "string",
            description: "Destination city from the search"
          },
          destination_country: {
            type: "string",
            description: "Destination country from the search"
          },
          storage_id: {
            type: "string",
            description: "Storage ID for any uploaded documents (optional)"
          }
        },
        required: ["user_choice"]
      }
    },
    server: {
      url: `${CONVEX_SITE_URL}/tools/confirm_visa_options`
    }
  }
];

async function listExistingTools(): Promise<ExistingTool[]> {
  try {
    const response = await fetch('https://api.vapi.ai/tool?limit=1000', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to list tools:', error);
      return [];
    }

    const tools = await response.json();
    return tools;
  } catch (error) {
    console.error('Error listing tools:', error);
    return [];
  }
}

async function createTool(tool: VapiTool): Promise<{ id: string; name: string } | null> {
  try {
    const response = await fetch('https://api.vapi.ai/tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`
      },
      body: JSON.stringify(tool)
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

async function updateTool(toolId: string, tool: VapiTool): Promise<boolean> {
  try {
    const response = await fetch(`https://api.vapi.ai/tool/${toolId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`
      },
      body: JSON.stringify(tool)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to update tool ${tool.function.name}:`, error);
      return false;
    }

    console.log(`✅ Updated tool: ${tool.function.name} (ID: ${toolId})`);
    return true;
  } catch (error) {
    console.error(`Error updating tool ${tool.function.name}:`, error);
    return false;
  }
}

async function deleteTool(toolId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.vapi.ai/tool/${toolId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to delete tool ${toolId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting tool ${toolId}:`, error);
    return false;
  }
}

async function updateAssistantTools(toolIds: string[]) {
  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: {
          provider: "openai",
          model: "gpt-4o",
          toolIds: toolIds
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to update assistant:', error);
      return false;
    }

    console.log('✅ Assistant updated with all tools');
    return true;
  } catch (error) {
    console.error('Error updating assistant:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Vapi tool registration...');
  console.log(`📍 Using Convex site URL: ${CONVEX_SITE_URL}`);
  console.log(`🤖 Assistant ID: ${VAPI_ASSISTANT_ID}\n`);

  if (!VAPI_API_KEY) {
    console.error('❌ VAPI_API_KEY not found in environment variables');
    process.exit(1);
  }

  if (!VAPI_ASSISTANT_ID) {
    console.error('❌ NEXT_PUBLIC_VAPI_ASSISTANT_ID not found in environment variables');
    process.exit(1);
  }

  // Step 1: List existing tools
  console.log('📋 Fetching existing tools...');
  const existingTools = await listExistingTools();
  console.log(`Found ${existingTools.length} existing tools\n`);

  // Create a map of existing tools by name
  const existingToolsByName = new Map<string, ExistingTool[]>();
  for (const tool of existingTools) {
    if (tool.type === 'function' && tool.function?.name) {
      const name = tool.function.name;
      if (!existingToolsByName.has(name)) {
        existingToolsByName.set(name, []);
      }
      existingToolsByName.get(name)!.push(tool);
    }
  }

  // Step 2: Process each tool
  const finalToolIds: string[] = [];

  for (const tool of tools) {
    const toolName = tool.function.name;
    const existing = existingToolsByName.get(toolName) || [];

    if (existing.length === 0) {
      // Create new tool
      console.log(`🆕 Creating new tool: ${toolName}`);
      const result = await createTool(tool);
      if (result) {
        finalToolIds.push(result.id);
      }
    } else if (existing.length === 1) {
      // Update existing tool
      console.log(`🔄 Updating existing tool: ${toolName}`);
      const success = await updateTool(existing[0].id, tool);
      if (success) {
        finalToolIds.push(existing[0].id);
      }
    } else {
      // Multiple duplicates - clean up and keep one
      console.log(`⚠️  Found ${existing.length} duplicates for ${toolName}, cleaning up...`);
      
      // Sort by creation date (newest first)
      existing.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Keep the newest, delete the rest
      for (let i = 1; i < existing.length; i++) {
        console.log(`  🗑️  Deleting duplicate: ${existing[i].id}`);
        await deleteTool(existing[i].id);
      }
      
      // Update the one we kept
      console.log(`  🔄 Updating kept tool: ${existing[0].id}`);
      const success = await updateTool(existing[0].id, tool);
      if (success) {
        finalToolIds.push(existing[0].id);
      }
    }
  }

  // Step 3: Clean up any old tools not in our list
  const ourToolNames = new Set(tools.map(t => t.function.name));
  for (const [name, toolList] of existingToolsByName) {
    if (!ourToolNames.has(name)) {
      console.log(`🗑️  Removing obsolete tool: ${name}`);
      for (const tool of toolList) {
        await deleteTool(tool.id);
      }
    }
  }

  console.log(`\n📝 Registered ${finalToolIds.length}/${tools.length} tools`);

  // Step 4: Update assistant with final tool list
  if (finalToolIds.length > 0) {
    console.log('\n🔄 Updating assistant with tools...');
    const success = await updateAssistantTools(finalToolIds);
    
    if (success) {
      console.log('\n✨ All tools registered and assistant updated successfully!');
      console.log('\nTool IDs for reference:');
      finalToolIds.forEach(id => console.log(`  - ${id}`));
    } else {
      console.log('\n⚠️  Tools registered but assistant update failed. Please update manually.');
    }
  } else {
    console.log('\n❌ No tools were registered. Please check the errors above.');
  }
}

main().catch(console.error);
