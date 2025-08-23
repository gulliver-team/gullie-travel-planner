import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, customerEmail, customerName } = body;

    // Create checkout session with Polar API
    const polarResponse = await fetch("https://api.polar.sh/v1/checkouts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId || process.env.POLAR_PRODUCT_ID,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
        customer_email: customerEmail || user.email,
        customer_name: customerName || user.firstName || user.email,
        metadata: {
          userId: user.id,
          workosUserId: user.id,
        },
      }),
    });

    if (!polarResponse.ok) {
      const error = await polarResponse.text();
      console.error("Polar API error:", error);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    const checkoutData = await polarResponse.json();
    
    return NextResponse.json({
      checkoutUrl: checkoutData.url,
      checkoutId: checkoutData.id,
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}