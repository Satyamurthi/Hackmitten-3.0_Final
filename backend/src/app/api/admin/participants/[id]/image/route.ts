import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError, requirePermission } from "@/lib/api-auth";
import { readPrivateFile, readPublicUpload } from "@/lib/upload";
import { participantImageContentDisposition, participantImageFilename } from "@/lib/participant-image-filename";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("registration:view");
    const { id } = await params;
    const participant = await db.participant.findUnique({
      where: { id },
      select: { fullName: true, participantImagePath: true, participantImageMimeType: true },
    });
    if (!participant?.participantImagePath) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const imagePath = participant.participantImagePath;

    if (imagePath.startsWith("private://")) {
      const image = await readPrivateFile(imagePath);
      if (!image) {
        return NextResponse.json({ error: "Image file not found" }, { status: 404 });
      }

      const effectiveMime = participant.participantImageMimeType || image.contentType || "image/jpeg";
      const filename = participantImageFilename(participant.fullName, effectiveMime) || "participant.jpg";

      return new Response(new Uint8Array(image.data), {
        headers: {
          "Content-Type": image.contentType || effectiveMime,
          "Content-Disposition": participantImageContentDisposition(filename),
          "Cache-Control": "private, max-age=60",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (imagePath.startsWith("/api/uploads/")) {
      const match = imagePath.match(/^\/api\/uploads\/([a-z0-9_-]{1,40}_[a-f0-9]{12}\.(?:jpg|png|webp|gif))$/);
      if (match) {
        const contents = await readPublicUpload(match[1]);
        if (contents) {
          const ext = match[1].slice(match[1].lastIndexOf(".") + 1).toLowerCase();
          const contentType =
            ext === "png" ? "image/png" :
            ext === "webp" ? "image/webp" :
            ext === "gif" ? "image/gif" :
            "image/jpeg";
          const filename = participantImageFilename(participant.fullName, contentType) || "participant.jpg";

          return new Response(new Uint8Array(contents), {
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": participantImageContentDisposition(filename),
              "Cache-Control": "private, max-age=60",
              "X-Content-Type-Options": "nosniff",
            },
          });
        }
      }
    }

    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } catch (error) {
    return jsonError(error);
  }
}
