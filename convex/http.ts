import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// CORS headers - disabled for Vapi as requested
const corsHeaders = {};

// Helper function to format tool response
const formatToolResponse = (toolCallId: string, result: any) => ({
  results: [
    {
      toolCallId,
      result: typeof result === "string" ? result : JSON.stringify(result),
    },
  ],
});

// City Search Tool
http.route({
  path: "/tools/search_relocation_options",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let toolCallId = "error";
    
    try {
      const body = await request.json() as any;
      const { message, call } = body || {};
      const { toolCallList } = message || {};
      
      if (!toolCallList || !toolCallList[0]) {
        throw new Error("No tool call found in request");
      }
      
      const toolCall = toolCallList[0];
      toolCallId = toolCall.id || "error";
      const args = toolCall.arguments || toolCall.function?.arguments || {};
      const { origin_city, origin_country, destination_city, destination_country } = args;

      // Track conversation and tool call
      if (call?.id) {
        await ctx.runAction(internal.tools.conversationTracker.trackConversation, {
          callId: call.id,
          sessionId: call.sessionId,
          message: {
            type: "tool-calls",
            toolCall: {
              name: "search_relocation_options",
              arguments: args,
            },
          },
          call,
        });
        
        // Extract and save data
        await ctx.runAction(internal.tools.conversationTracker.extractConversationData, {
          callId: call.id,
          extractedData: {
            originCity: origin_city,
            originCountry: origin_country,
            destinationCity: destination_city,
            destinationCountry: destination_country,
          },
        });
      }

      // Call internal mutation to search and store results
      const results = await ctx.runMutation(internal.tools.citySearch.searchRelocationOptions, {
        originCity: origin_city,
        originCountry: origin_country,
        destinationCity: destination_city,
        destinationCountry: destination_country,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, results)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error("City search error:", error);
      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, `I'm having trouble searching for relocation options: ${error.message}`)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Visa Requirements Tool
http.route({
  path: "/tools/get_visa_requirements",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let body: any;
    let toolCallId = "error";
    
    try {
      body = await request.json() as any;
      console.log("Visa requirements request:", JSON.stringify(body, null, 2));
      
      const { message } = body || {};
      const { toolCallList } = message || {};
      
      if (!toolCallList || !toolCallList[0]) {
        throw new Error("No tool call found in request");
      }
      
      const toolCall = toolCallList[0];
      toolCallId = toolCall.id || "error";
      
      // Handle both `arguments` and `function.arguments` structures
      const args = toolCall.arguments || toolCall.function?.arguments || {};
      
      console.log("Parsed arguments:", JSON.stringify(args, null, 2));
      
      if (!args.origin_country || !args.destination_country || !args.visa_type) {
        console.error("Missing parameters. Received args:", args);
        throw new Error("Missing required parameters: origin_country, destination_country, or visa_type");
      }
      
      const { origin_country, destination_country, visa_type } = args;

      const requirements = await ctx.runAction(internal.tools.visaRequirements.getVisaRequirements, {
        callId: "http-call-" + Date.now(), // Generate a unique call ID for HTTP requests
        originCountry: origin_country,
        destinationCountry: destination_country,
        visaType: visa_type,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, requirements)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error("Visa requirements error:", error);
      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, `I couldn't retrieve visa requirements: ${error.message}`)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Cost Estimation Tool
http.route({
  path: "/tools/estimate_relocation_costs",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let toolCallId = "error";
    
    try {
      const body = await request.json() as any;
      const { message } = body || {};
      const { toolCallList } = message || {};
      
      if (!toolCallList || !toolCallList[0]) {
        throw new Error("No tool call found in request");
      }
      
      const toolCall = toolCallList[0];
      toolCallId = toolCall.id || "error";
      const args = toolCall.arguments || toolCall.function?.arguments || {};
      const { destination_city, include_flight, include_housing, include_moving, family_size } = args;

      const costs = await ctx.runMutation(internal.tools.costEstimation.estimateRelocationCosts, {
        destinationCity: destination_city,
        includeFlight: include_flight || true,
        includeHousing: include_housing || true,
        includeMoving: include_moving || true,
        familySize: family_size || 1,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, costs)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error("Cost estimation error:", error);
      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, `I couldn't calculate costs: ${error.message}`)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Document Requirements Tool
http.route({
  path: "/tools/get_document_details",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let toolCallId = "error";
    
    try {
      const body = await request.json() as any;
      const { message } = body || {};
      const { toolCallList } = message || {};
      
      if (!toolCallList || !toolCallList[0]) {
        throw new Error("No tool call found in request");
      }
      
      const toolCall = toolCallList[0];
      toolCallId = toolCall.id || "error";
      const args = toolCall.arguments || toolCall.function?.arguments || {};
      const { document_type, country } = args;

      const details = await ctx.runMutation(internal.tools.documentDetails.getDocumentDetails, {
        documentType: document_type,
        country: country,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, details)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error("Document details error:", error);
      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, `I couldn't retrieve document details: ${error.message}`)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Email Capture Tool
http.route({
  path: "/tools/capture_contact_info",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let toolCallId = "error";
    
    try {
      const body = await request.json() as any;
      const { message } = body || {};
      const { toolCallList } = message || {};
      
      if (!toolCallList || !toolCallList[0]) {
        throw new Error("No tool call found in request");
      }
      
      const toolCall = toolCallList[0];
      toolCallId = toolCall.id || "error";
      const args = toolCall.arguments || toolCall.function?.arguments || {};
      const { email, phone, name } = args;

      // Store contact info
      await ctx.runMutation(internal.tools.emailCapture.captureContactInfo, {
        email,
        phone,
        name,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, "Thank you! I've saved your contact information.")),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error("Contact capture error:", error);
      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, `I couldn't save your contact information: ${error.message}`)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Send PDF Tool
http.route({
  path: "/tools/send_pdf_report",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let toolCallId = "error";
    
    try {
      const body = await request.json() as any;
      console.log("PDF send request:", JSON.stringify(body, null, 2));
      
      const { message } = body || {};
      const { toolCallList } = message || {};
      
      if (!toolCallList || !toolCallList[0]) {
        throw new Error("No tool call found in request");
      }
      
      const toolCall = toolCallList[0];
      toolCallId = toolCall.id || "error";
      const args = toolCall.arguments || toolCall.function?.arguments || {};
      
      console.log("PDF send arguments:", JSON.stringify(args, null, 2));
      
      if (!args.email) {
        throw new Error("Email is required to send PDF report");
      }
      
      const { email, consultation_data } = args;

      // Trigger PDF generation and email send
      await ctx.runAction(internal.tools.pdfSender.sendEmailReport, {
        email,
        consultationData: consultation_data || "",
      });

      return new Response(
        JSON.stringify(formatToolResponse(
          toolCallId, 
          "Perfect! I'm preparing your comprehensive relocation report and will send it to your email shortly. You should receive it within the next few minutes."
        )),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error("PDF send error:", error);
      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, `I couldn't send the PDF report: ${error.message}`)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Visa Options Confirmation Tool - Enhanced for user choice
http.route({
  path: "/tools/confirm_visa_options",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let toolCallId = "error";
    
    try {
      const body = await request.json() as any;
      const { message } = body || {};
      const { toolCallList } = message || {};
      
      if (!toolCallList || !toolCallList[0]) {
        throw new Error("No tool call found in request");
      }
      
      const toolCall = toolCallList[0];
      toolCallId = toolCall.id || "error";
      const args = toolCall.arguments || toolCall.function?.arguments || {};
      const { user_choice, email, name, search_data, origin_city, origin_country, destination_city, destination_country, storage_id } = args;

      if (user_choice === "email") {
        if (email && name) {
          // User provided email, send the report
          const result = await ctx.runMutation(internal.tools.citySearch.confirmEmailSend, {
            email,
            name,
            searchData: search_data || "",
            originCity: origin_city || "",
            originCountry: origin_country || "",
            destinationCity: destination_city || "",
            destinationCountry: destination_country || "",
            storageId: storage_id,
          });
          
          return new Response(
            JSON.stringify(formatToolResponse(toolCallId, result)),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          // Ask for email
          return new Response(
            JSON.stringify(formatToolResponse(
              toolCallId,
              "Great! I'll send you a comprehensive PDF report with all the visa details. Please provide your email address and name so I can send it to you."
            )),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } else if (user_choice === "discuss") {
        return new Response(
          JSON.stringify(formatToolResponse(
            toolCallId,
            "Perfect! I'm here to discuss any of these visa options in detail. Which option interests you most, or do you have specific questions about requirements, timelines, or costs?"
          )),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        // Default response waiting for user choice
        return new Response(
          JSON.stringify(formatToolResponse(
            toolCallId,
            "Please let me know if you'd like me to send you a detailed PDF report to your email, or if you'd prefer to discuss the options right now."
          )),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (error: any) {
      console.error("Visa confirmation error:", error);
      return new Response(
        JSON.stringify(formatToolResponse(toolCallId, `I couldn't process your request: ${error.message}`)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// OPTIONS handler for CORS preflight
http.route({
  path: "/tools/search_relocation_options",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/tools/get_visa_requirements",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/tools/estimate_relocation_costs",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/tools/get_document_details",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/tools/capture_contact_info",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/tools/send_pdf_report",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/tools/confirm_visa_options",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// Vapi Webhook Handler
http.route({
  path: "/webhooks/vapi",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      
      // Log webhook event
      console.log("Vapi webhook received:", body.type);
      
      // Handle different webhook types
      switch (body.type) {
        case "call-started":
          console.log("Call started:", body.call.id);
          break;
        case "call-ended":
          console.log("Call ended:", body.call.id);
          // Could trigger post-call actions here
          break;
        case "transcript":
          console.log("Transcript:", body.transcript);
          break;
        default:
          console.log("Unknown webhook type:", body.type);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
});

// Polar Webhook Handler
http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const headers = request.headers;
      
      // TODO: Add webhook signature validation once POLAR_WEBHOOK_SECRET is set
      // For now, we'll process the webhook without validation
      
      const event = JSON.parse(body);
      console.log("Polar webhook received:", event.type);
      
      // Handle different Polar webhook events
      switch (event.type) {
        case "subscription.created":
        case "subscription.updated":
          await ctx.runMutation(internal.subscriptions.upsertSubscription, {
            polarId: event.data.id,
            userId: event.data.customer_id,
            productId: event.data.product_id,
            status: event.data.status,
            currentPeriodStart: event.data.current_period_start,
            currentPeriodEnd: event.data.current_period_end,
            cancelAtPeriodEnd: event.data.cancel_at_period_end || false,
            metadata: event.data,
          });
          break;
          
        case "subscription.canceled":
          await ctx.runMutation(internal.subscriptions.cancelSubscription, {
            polarId: event.data.id,
          });
          break;
          
        case "checkout.created":
          console.log("Checkout created:", event.data.id);
          break;
          
        case "checkout.updated":
          if (event.data.status === "succeeded") {
            await ctx.runMutation(internal.subscriptions.recordCheckout, {
              checkoutId: event.data.id,
              customerId: event.data.customer_id,
              productId: event.data.product_id,
              amount: event.data.amount,
              currency: event.data.currency,
              metadata: event.data,
            });
          }
          break;
          
        default:
          console.log("Unhandled Polar webhook type:", event.type);
      }
      
      return new Response(null, { status: 202 });
    } catch (error) {
      console.error("Polar webhook error:", error);
      return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Vapi Conversation Webhook - for tracking conversation updates
http.route({
  path: "/vapi/conversation-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as any;
      const { message, call } = body || {};
      
      console.log("Vapi conversation webhook:", message?.type);
      
      if (call?.id) {
        // Track all conversation events
        await ctx.runAction(internal.tools.conversationTracker.trackConversation, {
          callId: call.id,
          sessionId: call.sessionId,
          message: {
            type: message.type || "unknown",
            role: message.role,
            content: message.content || message.transcript,
            transcript: message.transcript,
            timestamp: message.timestamp || Date.now(),
          },
          call,
        });
      }
      
      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Vapi conversation webhook error:", error);
      return new Response(null, { status: 200 });
    }
  }),
});

// Get conversation context endpoint for Vapi
http.route({
  path: "/vapi/get-context",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as any;
      const { sessionId, callId, limit } = body;
      
      const context = await ctx.runAction(internal.tools.conversationTracker.getConversationContext, {
        sessionId,
        callId,
        limit: limit || 5,
      });
      
      return new Response(JSON.stringify(context), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Get context error:", error);
      return new Response(JSON.stringify({ 
        transcript: [], 
        extractedData: {}, 
        conversationCount: 0 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;