import { NextResponse } from "next/server";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unknown error";
}

export function logRouteError(
  route: string,
  error: unknown,
  context?: Record<string, unknown>
): string {
  const errorMessage = getErrorMessage(error);
  console.error(`[${route}]`, {
    ...context,
    errorMessage,
    error,
  });
  return errorMessage;
}

export function apiErrorResponse(
  route: string,
  error: unknown,
  fallbackCode: string,
  status = 500,
  context?: Record<string, unknown>
) {
  const errorMessage = logRouteError(route, error, context);
  return NextResponse.json({ error: fallbackCode, errorMessage }, { status });
}
