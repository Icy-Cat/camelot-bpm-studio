import {
  AnalyticsManager,
  ClarityAnalyticsProvider,
  GoogleAnalyticsProvider,
  OpenPanelAnalyticsProvider,
  PlausibleAnalyticsProvider,
  PvuvAnalyticsProvider,
  VercelAnalyticsProvider,
} from '@/extensions/analytics';
import { Configs, getAllConfigs } from '@/shared/models/config';

/**
 * get analytics manager with configs
 */
export function getAnalyticsManagerWithConfigs(configs: Configs) {
  const analytics = new AnalyticsManager();

  // google analytics
  if (configs.google_analytics_id) {
    analytics.addProvider(
      new GoogleAnalyticsProvider({ gaId: configs.google_analytics_id })
    );
  }

  // clarity
  if (configs.clarity_id) {
    analytics.addProvider(
      new ClarityAnalyticsProvider({ clarityId: configs.clarity_id })
    );
  }

  // plausible
  if (configs.plausible_domain && configs.plausible_src) {
    analytics.addProvider(
      new PlausibleAnalyticsProvider({
        domain: configs.plausible_domain,
        src: configs.plausible_src,
      })
    );
  }

  // openpanel
  if (configs.openpanel_client_id) {
    analytics.addProvider(
      new OpenPanelAnalyticsProvider({
        clientId: configs.openpanel_client_id,
      })
    );
  }

  // vercel analytics
  if (configs.vercel_analytics_enabled === 'true') {
    analytics.addProvider(new VercelAnalyticsProvider({ mode: 'auto' }));
  }

  // pvuv.ai analytics
  const pvuvSiteId =
    configs.pvuv_site_id ||
    process.env.PVUV_SITE ||
    process.env.NEXT_PUBLIC_PVUV_SITE_ID;
  if (pvuvSiteId) {
    analytics.addProvider(
      new PvuvAnalyticsProvider({
        siteId: pvuvSiteId,
        apiUrl: 'https://in.pvuv.ai',
        exclude: '/admin/*,/*/admin/*',
      })
    );
  }

  return analytics;
}

/**
 * global analytics service
 */
let analyticsService: AnalyticsManager | null = null;

/**
 * get analytics service instance
 */
export async function getAnalyticsService(
  configs?: Configs
): Promise<AnalyticsManager> {
  if (!configs) {
    configs = await getAllConfigs();
  }
  analyticsService = getAnalyticsManagerWithConfigs(configs);

  return analyticsService;
}
