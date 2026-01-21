export function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'string') return err;

  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>;

    const topMessage = record['message'];
    if (typeof topMessage === 'string' && topMessage.trim().length > 0) {
      return topMessage;
    }

    const inner = record['error'];
    if (inner && typeof inner === 'object') {
      const innerRecord = inner as Record<string, unknown>;
      const innerMessage = innerRecord['message'];
      if (typeof innerMessage === 'string' && innerMessage.trim().length > 0) {
        return innerMessage;
      }
    }
  }

  return fallback;
}
