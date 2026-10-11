import { NextResponse } from "next/server";
import { checkAndSendHourlyRegistrations } from "@/lib/hourly-notifier";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const minutes = url.searchParams.get("minutes");
    const forceWindowMinutes = minutes ? Math.max(1, Math.min(1440, Number(minutes))) : undefined;

    const result = await checkAndSendHourlyRegistrations(forceWindowMinutes);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to run hourly check" },
      { status: 500 }
    );
  }
}
