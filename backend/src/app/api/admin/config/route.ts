import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { ensureSingletonEventConfig } from "@/lib/bootstrap";

export async function GET() {
  try {
    await requirePermission("config:edit");
    const config = await ensureSingletonEventConfig();
    return NextResponse.json({ config: {
      registrationEnabled: config.registrationEnabled,
      registrationLimit: config.registrationLimit,
      eventStartDate: config.eventStartDate,
      eventStartTime: config.eventStartTime,
    } });
  } catch (error) { return jsonError(error); }
}

export async function PATCH(request: Request) {
  try {
    await requirePermission("config:edit");
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid registration settings" }, { status: 400 });
    const data = body as Record<string, unknown>;
    
    const current = await ensureSingletonEventConfig();
    const enabled = data.registrationEnabled === undefined ? current.registrationEnabled : data.registrationEnabled;
    const limit = data.registrationLimit === undefined ? current.registrationLimit : data.registrationLimit;
    const startDate = data.eventStartDate === undefined ? current.eventStartDate : (data.eventStartDate as string | null);
    const startTime = data.eventStartTime === undefined ? current.eventStartTime : (data.eventStartTime as string | null);
    
    if (typeof enabled !== "boolean" || !(limit === null || (typeof limit === "number" && Number.isSafeInteger(limit) && limit >= 1 && limit <= 1_000_000))) {
      return NextResponse.json({ error: "Registration enabled must be boolean and limit must be a positive integer or null" }, { status: 400 });
    }
    const updated = await db.eventConfig.update({ 
      where: { id: "singleton" }, 
      data: { registrationEnabled: enabled, registrationLimit: limit, eventStartDate: startDate, eventStartTime: startTime } 
    });
    return NextResponse.json({ config: { 
      registrationEnabled: updated.registrationEnabled, 
      registrationLimit: updated.registrationLimit,
      eventStartDate: updated.eventStartDate,
      eventStartTime: updated.eventStartTime,
    } });
  } catch (error) { return jsonError(error); }
}
