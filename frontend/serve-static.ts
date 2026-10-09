import { serve } from "bun";
import { join } from "path";

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // 1. Proxy /api and /uploads to the backend (mimicking Nginx)
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")) {
      const backendOrigin = (process.env.BACKEND_API_ORIGIN ?? "https://hackmitten-3-0-api.mitt.edu.in").replace(/\/$/, "");
      const origin = req.headers.get("origin") ?? "*";

      if (req.method === "OPTIONS") {
        const corsHeaders = new Headers();
        corsHeaders.set("Access-Control-Allow-Origin", origin);
        corsHeaders.set("Access-Control-Allow-Credentials", "true");
        corsHeaders.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
        corsHeaders.set("Access-Control-Allow-Headers", "*");
        corsHeaders.set("Access-Control-Max-Age", "86400");
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      const targetUrl = new URL(url.pathname + url.search, backendOrigin);
      const res = await fetch(new Request(targetUrl.href, req));
      const resHeaders = new Headers(res.headers);
      resHeaders.set("Access-Control-Allow-Origin", origin);
      resHeaders.set("Access-Control-Allow-Credentials", "true");
      resHeaders.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
      resHeaders.set("Access-Control-Allow-Headers", "*");
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: resHeaders });
    }

    // 2. Serve static files from the frontend/out/ directory
    let path = url.pathname;
    if (path === "/") path = "/index.html";
    
    let file = Bun.file(join(import.meta.dir, "out", path));
    
    if (!(await file.exists())) {
      file = Bun.file(join(import.meta.dir, "out", path + ".html"));
      if (!(await file.exists())) {
        const notFoundFile = Bun.file(join(import.meta.dir, "out", "404.html"));
        if (await notFoundFile.exists()) {
          return new Response(notFoundFile, { status: 404, headers: { "Content-Type": "text/html" } });
        }
        return new Response("404 Not Found", { status: 404 });
      }
    }
    
    // Bun correctly infers the Content-Type from the file extension automatically
    // But let's explicitly set it just to be 100% foolproof for strict browsers!
    const headers = new Headers();
    if (path.endsWith(".css")) headers.set("Content-Type", "text/css");
    else if (path.endsWith(".js")) headers.set("Content-Type", "application/javascript");
    else if (path.endsWith(".woff2")) headers.set("Content-Type", "font/woff2");
    
    return new Response(file, { headers });
  },
});

const backendOrigin = (process.env.BACKEND_API_ORIGIN ?? "https://hackmitten-3-0-api.mitt.edu.in").replace(/\/$/, "");
console.log("Local testing server running on http://localhost:3000");
console.log(`Proxying /api and /uploads traffic to ${backendOrigin}`);
