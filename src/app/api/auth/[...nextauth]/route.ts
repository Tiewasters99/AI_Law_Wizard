import { authOptions } from "@/lib/backend/auth";
import NextAuth from "next-auth";

// Disable caching for all auth routes (especially session endpoint)
export const dynamic = "force-dynamic";
export const revalidate = 0;

const handler = NextAuth(authOptions);

// Add error handling wrapper with cache prevention headers
const wrappedHandler = async (req: Request, context: any) => {
  try {
    const response = await handler(req, context);
    
    // Clone response to modify headers
    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      
      // Add cache prevention headers to prevent disk caching
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
      
      // Return new response with updated headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });
    }
    
    return response;
  } catch (error) {
    console.error("NextAuth handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Authentication error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  }
};

export { wrappedHandler as GET, wrappedHandler as POST };
