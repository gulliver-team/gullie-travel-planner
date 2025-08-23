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
    try {
      const body = await request.json() as any;
      const { toolCallList } = body.message || {};
      const toolCall = toolCallList[0];
      const { origin_city, origin_country, destination_city, destination_country } = toolCall.arguments;

      // Call internal mutation to search and store results
      const results = await ctx.runMutation(internal.tools.citySearch.searchRelocationOptions, {
        originCity: origin_city,
        originCountry: origin_country,
        destinationCity: destination_city,
        destinationCountry: destination_country,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCall.id, results)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("City search error:", error);
      return new Response(
        JSON.stringify(formatToolResponse("error", "I'm having trouble searching for relocation options right now.")),
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
    try {
      const body = await request.json() as any;
      const { toolCallList } = body.message || {};
      const toolCall = toolCallList[0];
      const { origin_country, destination_country, visa_type } = toolCall.arguments;

      const requirements = await ctx.runMutation(internal.tools.visaRequirements.getVisaRequirements, {
        originCountry: origin_country,
        destinationCountry: destination_country,
        visaType: visa_type,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCall.id, requirements)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Visa requirements error:", error);
      return new Response(
        JSON.stringify(formatToolResponse("error", "I couldn't retrieve visa requirements at this time.")),
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
    try {
      const body = await request.json() as any;
      const { toolCallList } = body.message || {};
      const toolCall = toolCallList[0];
      const { destination_city, include_flight, include_housing, include_moving, family_size } = toolCall.arguments;

      const costs = await ctx.runMutation(internal.tools.costEstimation.estimateRelocationCosts, {
        destinationCity: destination_city,
        includeFlight: include_flight || true,
        includeHousing: include_housing || true,
        includeMoving: include_moving || true,
        familySize: family_size || 1,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCall.id, costs)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Cost estimation error:", error);
      return new Response(
        JSON.stringify(formatToolResponse("error", "I couldn't calculate costs at this time.")),
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
    try {
      const body = await request.json() as any;
      const { toolCallList } = body.message || {};
      const toolCall = toolCallList[0];
      const { document_type, country } = toolCall.arguments;

      const details = await ctx.runMutation(internal.tools.documentDetails.getDocumentDetails, {
        documentType: document_type,
        country: country,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCall.id, details)),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Document details error:", error);
      return new Response(
        JSON.stringify(formatToolResponse("error", "I couldn't retrieve document details at this time.")),
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
    try {
      const body = await request.json() as any;
      const { toolCallList } = body.message || {};
      const toolCall = toolCallList[0];
      const { email, phone, name } = toolCall.arguments;

      // Store contact info
      await ctx.runMutation(internal.tools.emailCapture.captureContactInfo, {
        email,
        phone,
        name,
      });

      return new Response(
        JSON.stringify(formatToolResponse(toolCall.id, "Thank you! I've saved your contact information.")),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Contact capture error:", error);
      return new Response(
        JSON.stringify(formatToolResponse("error", "I couldn't save your contact information.")),
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
    try {
      const body = await request.json() as any;
      const { toolCallList } = body.message || {};
      const toolCall = toolCallList[0];
      const { email, consultation_data } = toolCall.arguments;

      // Trigger PDF generation and email send
      await ctx.runAction(internal.tools.pdfSender.sendPDFReport, {
        email,
        consultationData: consultation_data,
      });

      return new Response(
        JSON.stringify(formatToolResponse(
          toolCall.id, 
          "Perfect! I'm preparing your comprehensive relocation report and will send it to your email shortly. You should receive it within the next few minutes."
        )),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("PDF send error:", error);
      return new Response(
        JSON.stringify(formatToolResponse("error", "I couldn't send the PDF report at this time.")),
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
    try {
      const body = await request.json() as any;
      const { toolCallList } = body.message || {};
      const toolCall = toolCallList[0];
      const { user_choice, email, name, search_data, origin_city, origin_country, destination_city, destination_country, storage_id } = toolCall.arguments;

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
            JSON.stringify(formatToolResponse(toolCall.id, result)),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          // Ask for email
          return new Response(
            JSON.stringify(formatToolResponse(
              toolCall.id,
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
            toolCall.id,
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
            toolCall.id,
            "Please let me know if you'd like me to send you a detailed PDF report to your email, or if you'd prefer to discuss the options right now."
          )),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      console.error("Visa confirmation error:", error);
      return new Response(
        JSON.stringify(formatToolResponse("error", "I couldn't process your request.")),
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

export default http;