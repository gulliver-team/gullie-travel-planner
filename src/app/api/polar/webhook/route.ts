import { NextRequest, NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";

//TODO: Add POLAR_WEBHOOK_SECRET to .env.local
// Get from: https://dashboard.polar.sh/webhooks

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("webhook-signature");
    const webhookId = request.headers.get("webhook-id");
    const webhookTimestamp = request.headers.get("webhook-timestamp");
    
    if (!signature || !webhookId || !webhookTimestamp) {
      return NextResponse.json(
        { error: "Missing webhook headers" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("POLAR_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Validate webhook signature
    const event = await validateEvent(
      body,
      {
        "webhook-signature": signature,
        "webhook-id": webhookId,
        "webhook-timestamp": webhookTimestamp,
      },
      webhookSecret
    );

    // Handle different event types
    switch (event.type) {
      case "subscription.created":
        console.log("New subscription created:", event.data);
        //TODO: Update user status in Convex
        // Mark user as subscribed
        // Enable full features
        break;
        
      case "subscription.updated":
        console.log("Subscription updated:", event.data);
        //TODO: Update subscription status
        break;
        
      case "subscription.canceled":
        console.log("Subscription canceled:", event.data);
        //TODO: Handle cancellation
        // Send retention email
        // Schedule access removal
        break;
        
      case "order.paid":
        console.log("Payment received:", event.data);
        //TODO: Record payment in database
        break;
        
      case "checkout.created":
        console.log("Checkout started:", event.data);
        //TODO: Track checkout analytics
        break;
        
      default:
        console.log("Unhandled webhook event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}