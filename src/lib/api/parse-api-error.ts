export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; errorMessage?: string };
    return data.errorMessage ?? data.error ?? `request_failed_${response.status}`;
  } catch {
    return `request_failed_${response.status}`;
  }
}
