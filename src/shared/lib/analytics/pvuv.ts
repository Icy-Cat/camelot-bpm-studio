declare global {
  interface Window {
    pvuv?: ((...args: any[]) => void) & { q?: any[][] };
  }
}

/**
 * Send a custom goal event to PVUV.ai (safe no-op if unavailable)
 */
export function trackPvuvEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || typeof window.pvuv !== 'function') {
    return;
  }
  try {
    if (props && Object.keys(props).length > 0) {
      window.pvuv('event', eventName, props);
    } else {
      window.pvuv('event', eventName);
    }
  } catch {
    // non-fatal analytics failure
  }
}

/**
 * Identify signed-in visitor using opaque internal user ID (never email/PII)
 */
export function identifyPvuvUser(userId: string): void {
  if (
    !userId ||
    typeof window === 'undefined' ||
    typeof window.pvuv !== 'function'
  ) {
    return;
  }
  try {
    window.pvuv('identify', userId);
  } catch {
    // non-fatal
  }
}
