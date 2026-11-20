import { ReactNode } from 'react';

import { AnalyticsConfigs, AnalyticsProvider } from '.';

export interface PvuvAnalyticsConfigs extends AnalyticsConfigs {
  siteId: string;
  apiUrl?: string;
  exclude?: string;
  release?: string;
}

/**
 * PVUV.ai Analytics Provider
 * Renders official queue stub + defer f.js directly in SSR <head>
 */
export class PvuvAnalyticsProvider implements AnalyticsProvider {
  readonly name = 'pvuv';
  configs: PvuvAnalyticsConfigs;

  constructor(configs: PvuvAnalyticsConfigs) {
    this.configs = configs;
  }

  getHeadScripts(): ReactNode {
    const siteId = this.configs.siteId?.trim();
    if (!siteId) return null;

    const apiUrl = this.configs.apiUrl || 'https://in.pvuv.ai';
    const exclude = this.configs.exclude || '/admin/*,/*/admin/*';
    const release =
      this.configs.release ||
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
      undefined;

    return (
      <>
        <script
          id="pvuv-stub"
          dangerouslySetInnerHTML={{
            __html:
              'window.pvuv=window.pvuv||function(){(window.pvuv.q=window.pvuv.q||[]).push(arguments)};',
          }}
        />
        <script
          id="pvuv-analytics"
          defer
          src="https://www.pvuv.ai/f.js"
          data-site={siteId}
          data-api={apiUrl}
          data-spa="true"
          data-exclude={exclude}
          {...(release ? { 'data-release': release } : {})}
        />
      </>
    );
  }
}
