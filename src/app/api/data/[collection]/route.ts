import { NextResponse } from "next/server";
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
    const data = readCollection(collection);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[api/data/${collection}]`, error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { collection } = await context.params;

  if (!isCollectionKey(collection)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    writeCollection(collection, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[api/data/${collection}]`, error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
