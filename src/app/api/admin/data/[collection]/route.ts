import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { readCollection } from "@/lib/db/collection-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_READ_KEYS = ["works"] as const;

type RouteContext = {
  params: Promise<{ collection: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { collection } = await context.params;

  if (!(ADMIN_READ_KEYS as readonly string[]).includes(collection)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await readCollection(collection as "works");
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[api/admin/data/${collection}]`, error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
