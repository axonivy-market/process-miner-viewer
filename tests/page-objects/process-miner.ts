import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

const GRAPH_SELECTOR = '.sprotty-graph:not(.hidden)';
const DIAGRAM_SELECTOR = '[data-svg-metadata-type="graph"]';
const startSelector = GRAPH_SELECTOR + ' .start\\:requestStart';

export class ProcessMiner {
  readonly page: Page;
  readonly graph: Locator;
  readonly diagram: Locator;

  constructor(page: Page) {
    this.page = page;
    this.graph = page.locator(GRAPH_SELECTOR);
    this.diagram = page.locator(DIAGRAM_SELECTOR);
  }

  static async openProcess(page: Page, options?: { urlQueryParam?: string }) {
    await page.goto(
      ProcessMiner.processEditorUrl(page, 'miner-test-project', '/processes/Humantask/ProcurementRequestParallel.p.json') +
      (options?.urlQueryParam ?? '')
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const waitForElement = page.locator(startSelector).first();
    // wait for start element, give a reload if was not visible the first time
    await waitForElement.waitFor({ state: 'visible', timeout: 10000 });
    if (!(await waitForElement.isVisible())) {
      await page.reload();
      await expect(waitForElement).toBeVisible();
    }
    return new ProcessMiner(page);
  }

  private static processEditorUrl(page: Page, pmv: string, file: string): string {
    const app = process.env.TEST_APP ?? 'designer';
    const baseUrl = process.env.CI ? 'http://localhost:4173' : 'http://localhost:3000';
    return `?server=${ProcessMiner.serverUrl()}&app=${app}&pmv=${pmv}&file=${file}&processUrl=${baseUrl}/mock.json`;
  }

  private static serverUrl(): string {
    const server = process.env.BASE_URL ?? 'localhost:8081';
    return server.replace(/^https?:\/\//, '');
  }
}
