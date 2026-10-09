import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/") && !request.nextUrl.pathname.startsWith("/uploads/")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  const allowOriginHeader = origin ?? "*";

  if (request.method === "OPTIONS") {
    const response = new Response(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", allowOriginHeader);
    if (origin) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
    response.headers.set("Vary", "Origin");
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", allowOriginHeader);
  if (origin) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  response.headers.set("Access-Control-Expose-Headers", "Content-Disposition");
  response.headers.set("Vary", "Origin");
  return response;
}

export const config = { matcher: ["/api/:path*", "/uploads/:path*"] };
