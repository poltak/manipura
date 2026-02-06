export function resolveRequestId(incoming?: string | null): string {
  const trimmed = incoming?.trim();
  if (trimmed) {
    return trimmed;
  }

  const random = Math.random().toString(36).slice(2, 10);
  return `req_${Date.now()}_${random}`;
}
