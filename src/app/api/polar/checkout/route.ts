import { NextRequest, NextResponse } from "next/server";

//TODO: Add POLAR_ACCESS_TOKEN to .env.local
// Get from: https://dashboard.polar.sh
// Create a product with £1000/month pricing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userName, metadata } = body;

    const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
    const polarProductId = process.env.POLAR_PRODUCT_ID;
    
    if (!polarAccessToken || !polarProductId) {
      console.error("Polar configuration missing");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    // Create checkout session with Polar
    const response = await fetch("https://api.polar.sh/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${polarAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: polarProductId,
        customer_email: email,
        customer_name: userName,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        metadata: {
          ...metadata,
          service: "gullie-relocation",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Polar API error:", error);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      checkoutUrl: data.url,
      checkoutId: data.id,
    });
  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}