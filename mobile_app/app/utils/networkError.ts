export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("network request failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("cannot reach the server") ||
    msg.includes("request timed out") ||
    error.name === "AbortError"
  );
}
