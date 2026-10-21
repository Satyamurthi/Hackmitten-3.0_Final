import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError, requirePermission } from "@/lib/api-auth";
import { detectImageMime, readPrivateFile, readPublicUpload } from "@/lib/upload";
import { participantImageContentDisposition, participantImageFilename } from "@/lib/participant-image-filename";
import { findParticipantPhotoBuffer } from "@/lib/id-card-generator";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("registration:view");
    const { id } = await params;
    const participant = await db.participant.findUnique({
      where: { id },
      select: { fullName: true, participantImagePath: true, participantImageMimeType: true, participantId: true },
    });
    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    // 1. Try resilient participant photo resolution (private storage, photos dir, public uploads)
    const photoBuffer = await findParticipantPhotoBuffer({
      id,
      fullName: participant.fullName,
      participantId: participant.participantId,
      participantImagePath: participant.participantImagePath,
    });

    if (photoBuffer && photoBuffer.length > 0) {
      const detectedMime = detectImageMime(new Uint8Array(photoBuffer.subarray(0, 12)));
      const contentType = detectedMime || participant.participantImageMimeType || "image/jpeg";
      const filename = participantImageFilename(participant.fullName, contentType) || "participant.jpg";

      return new Response(new Uint8Array(photoBuffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": participantImageContentDisposition(filename),
          "Cache-Control": "private, max-age=60",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // 2. Direct fallback for private uploads if path is set
    if (participant.participantImagePath?.startsWith("private://")) {
      const image = await readPrivateFile(participant.participantImagePath);
      if (image) {
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
    }

    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } catch (error) {
    return jsonError(error);
  }
}

