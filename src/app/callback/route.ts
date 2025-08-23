import { handleAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

export const GET = handleAuth({
  onError: async (error) => {
    console.error("Error authenticating", error);
    
    return NextResponse.json(
      { error: "Authentication failed, reason: " + JSON.stringify(error) },
      { status: 500 }
    );
  },
});