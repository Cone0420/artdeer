import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/route-error";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { readCollection, writeCollection } from "@/lib/db/collection-service";
import {
  ADMIN_COLLECTIONS,
  PUBLIC_COLLECTIONS,
  type CollectionKey,
} from "@/lib/db/constants";

const ALL_KEYS = new Set<string>([...PUBLIC_COLLECTIONS, ...ADMIN_COLLECTIONS]);

function isCollectionKey(value: string): value is CollectionKey {
  return ALL_KEYS.has(value);
}

type RouteContext = {
  params: Promise<{ collection: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { collection } = await context.params;

  if (!isCollectionKey(collection)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if ((ADMIN_COLLECTIONS as readonly string[]).includes(collection)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await readCollection(collection);
    return NextResponse.json(data);
  } catch (error) {
    return apiErrorResponse(`api/data/${collection} GET`, error, "load_failed");
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { collection } = await context.params;

  if (!isCollectionKey(collection)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await writeCollection(collection, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(`api/data/${collection} PUT`, error, "save_failed");
  }
}
