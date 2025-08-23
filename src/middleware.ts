import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  redirectUri:
    process.env.VERCEL_TARGET_ENV === "preview" || process.env.VERCEL_TARGET_ENV === "production" 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}${process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI}`
      : `http://localhost:3000${process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI}`,
});

// Match against pages that require auth
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Protect API routes
    "/(api|trpc)(.*)",
    // Protect authenticated pages
    "/dashboard/:path*",
    "/account/:path*",
    "/billing/:path*",
    "/subscription/:path*",
  ],
};