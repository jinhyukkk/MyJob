import type { CrawlerAdapter } from '../types';
import { cjRecruit } from './cj_recruit';

export const adapters: Record<string, CrawlerAdapter> = {
  [cjRecruit.key]: cjRecruit,
};

export function getAdapter(key: string): CrawlerAdapter | null {
  return adapters[key] ?? null;
}
