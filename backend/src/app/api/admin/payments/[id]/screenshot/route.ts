import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { readPrivateFile, readPublicUpload } from "@/lib/upload";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("registration:view");
    const { id } = await params;

    const screenshotId = new URL(req.url).searchParams.get("screenshotId");
    const screenshot = await db.paymentScreenshot.findFirst({
      where: { paymentId: id, ...(screenshotId ? { id: screenshotId } : {}) },
      orderBy: { createdAt: "desc" },
      select: { filePath: true, mimeType: true },
    });
    if (!screenshot) return NextResponse.json({ error: "No screenshot" }, { status: 404 });
    const filePath = screenshot.filePath;

    // Private files
    if (filePath.startsWith("private://")) {
      const result = await readPrivateFile(filePath);
      if (!result) {
        return NextResponse.json({ error: "Screenshot file not found" }, { status: 404 });
      }
      return new Response(new Uint8Array(result.data), {
        headers: {
          "Content-Type": result.contentType || screenshot.mimeType || "image/jpeg",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "private, max-age=60",
        },
      });
    }

    // Public / legacy uploads
    if (filePath.startsWith("/api/uploads/")) {
      const match = filePath.match(/^\/api\/uploads\/([a-z0-9_-]{1,40}_[a-f0-9]{12}\.(?:jpg|png|webp|gif))$/);
      if (match) {
        const contents = await readPublicUpload(match[1]);
        if (contents) {
          const ext = match[1].slice(match[1].lastIndexOf(".") + 1).toLowerCase();
          const contentType =
            ext === "png" ? "image/png" :
            ext === "webp" ? "image/webp" :
            ext === "gif" ? "image/gif" :
            "image/jpeg";
          return new Response(new Uint8Array(contents), {
            headers: {
              "Content-Type": contentType,
              "X-Content-Type-Options": "nosniff",
              "Cache-Control": "private, max-age=60",
            },
          });
        }
      }
    }

    return NextResponse.json({ error: "Screenshot not found" }, { status: 404 });
  } catch (err) {
    return jsonError(err);
  }
}
