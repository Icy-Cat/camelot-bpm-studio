/**
 * Server-side PVUV.ai event reporting helper.
 * Uses PVUV_SITE and PVUV_INGEST_TOKEN (server-only env vars).
 * Never throws so analytics can never disrupt business requests or webhooks.
 */
export async function trackPvuvServerEvent(event: {
  name: string;
  visitor_id?: string | null;
  user_id?: string | null;
  id?: string;
  revenue?: number;
  currency?: string;
  props?: Record<string, string | number | boolean>;
  path?: string;
  ts?: number;
}): Promise<void> {
  const siteId = process.env.PVUV_SITE;
  const ingestToken = process.env.PVUV_INGEST_TOKEN;
  if (!siteId || !ingestToken) return;
  if (!event.user_id && !event.visitor_id) return;

  try {
    await fetch(`https://api.pvuv.ai/v1/sites/${siteId}/events`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${ingestToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ events: [event] }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Analytics must never fail the request
  }
}
